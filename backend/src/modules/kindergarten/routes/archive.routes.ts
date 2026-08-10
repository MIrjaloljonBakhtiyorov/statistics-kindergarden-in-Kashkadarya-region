import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Router } from 'express';

import { resolveKindergartenId } from '../requestContext.js';
import { uploadsDir } from '../../shared/upload.js';
import { all, get, run } from './routeSupport.js';

export const archiveRoutes = Router();

const ensureArchiveTables = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS kindergarten_archive_documents (
      id TEXT PRIMARY KEY,
      kindergarten_id INTEGER NOT NULL,
      document_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT,
      mime_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS child_archive_documents (
      id TEXT PRIMARY KEY,
      kindergarten_id INTEGER NOT NULL,
      child_id TEXT NOT NULL,
      category TEXT NOT NULL,
      document_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT,
      mime_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS staff_archive_documents (
      id TEXT PRIMARY KEY,
      kindergarten_id INTEGER NOT NULL,
      staff_id TEXT NOT NULL,
      category TEXT NOT NULL,
      document_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT,
      mime_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS archive_hidden_documents (
      kindergarten_id INTEGER NOT NULL,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      document_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (kindergarten_id, owner_type, owner_id, document_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS archive_file_records (
      id TEXT PRIMARY KEY,
      kindergarten_id INTEGER NOT NULL,
      owner_type TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      document_id TEXT NOT NULL,
      document_table TEXT NOT NULL,
      category TEXT,
      document_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT,
      mime_type TEXT,
      file_exists BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(kindergarten_id, owner_type, document_id)
    )
  `);
};

const archiveFilePath = (fileUrl: string) => {
  if (!fileUrl || /^https?:\/\//i.test(fileUrl)) return null;
  let normalizedUrl = '';
  try {
    normalizedUrl = decodeURIComponent(fileUrl).replace(/\\/g, '/');
  } catch {
    return null;
  }
  if (!normalizedUrl.startsWith('/uploads/')) return null;
  const relativePath = normalizedUrl.replace(/^\/uploads\//, '');
  const resolved = path.resolve(uploadsDir, relativePath);
  const uploadRoot = path.resolve(uploadsDir);
  if (resolved !== uploadRoot && !resolved.startsWith(`${uploadRoot}${path.sep}`)) return null;
  return resolved;
};

const archiveFileExists = (fileUrl: string) => {
  try {
    const resolved = archiveFilePath(fileUrl);
    return resolved ? fs.existsSync(resolved) : Boolean(fileUrl && /^https?:\/\//i.test(fileUrl));
  } catch {
    return false;
  }
};

const deleteArchivePhysicalFile = (fileUrl: string) => {
  try {
    const resolved = archiveFilePath(fileUrl);
    if (!resolved || !fs.existsSync(resolved)) return;
    fs.unlinkSync(resolved);
  } catch (error) {
    console.warn('Archive file delete skipped:', error);
  }
};

const decorateArchiveDocument = <T extends { file_url?: string }>(document: T) => ({
  ...document,
  file_exists: document.file_url ? archiveFileExists(document.file_url) : false,
});

const upsertArchiveFileRecord = async (
  kindergartenId: string,
  ownerType: 'kindergarten' | 'child' | 'staff',
  ownerId: string,
  documentTable: string,
  document: {
    id: string;
    category?: string | null;
    document_name: string;
    file_url: string;
    file_name?: string | null;
    mime_type?: string | null;
  }
) => {
  if (!document.file_url) return;
  await run(
    `INSERT INTO archive_file_records
      (id, kindergarten_id, owner_type, owner_id, document_id, document_table, category, document_name, file_url, file_name, mime_type, file_exists, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (kindergarten_id, owner_type, document_id) DO UPDATE SET
       owner_id = excluded.owner_id,
       document_table = excluded.document_table,
       category = excluded.category,
       document_name = excluded.document_name,
       file_url = excluded.file_url,
       file_name = excluded.file_name,
       mime_type = excluded.mime_type,
       file_exists = excluded.file_exists,
       updated_at = excluded.updated_at`,
    [
      crypto.randomUUID(),
      kindergartenId,
      ownerType,
      ownerId,
      document.id,
      documentTable,
      document.category || null,
      document.document_name,
      document.file_url,
      document.file_name || null,
      document.mime_type || null,
      archiveFileExists(document.file_url),
      new Date().toISOString(),
      new Date().toISOString(),
    ]
  );
};

const deleteArchiveFileRecord = async (kindergartenId: string, ownerType: string, documentId: string) => {
  await run(
    `DELETE FROM archive_file_records
     WHERE kindergarten_id = ? AND owner_type = ? AND document_id = ?`,
    [kindergartenId, ownerType, documentId]
  );
};

const childSingleDocumentCategories = new Set(['FATHER_PASSPORT', 'MOTHER_PASSPORT', 'BIRTH_CERTIFICATE', 'MEDICAL']);
const staffSingleDocumentCategories = new Set(['PASSPORT']);

archiveRoutes.get('/archive/kindergarten-documents', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const documents = await all(
      `SELECT id, kindergarten_id, document_name, file_url, file_name, mime_type, created_at
       FROM kindergarten_archive_documents
       WHERE kindergarten_id = ?
       ORDER BY created_at DESC`,
      [kindergartenId]
    );
    await Promise.all(documents.map((document: any) =>
      upsertArchiveFileRecord(kindergartenId, 'kindergarten', String(kindergartenId), 'kindergarten_archive_documents', document)
    ));
    res.json(documents.map(decorateArchiveDocument));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.post('/archive/kindergarten-documents', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const body = req.body || {};
    const documentName = String(body.document_name || '').trim();
    const fileUrl = String(body.file_url || '').trim();
    const fileName = String(body.file_name || '').trim();
    const mimeType = String(body.mime_type || '').trim();

    if (!documentName) return res.status(400).json({ error: 'Dokument nomi kiritilishi shart' });
    if (!fileUrl) return res.status(400).json({ error: 'Hujjat fayli yuklanishi shart' });

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await run(
      `INSERT INTO kindergarten_archive_documents
        (id, kindergarten_id, document_name, file_url, file_name, mime_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, kindergartenId, documentName, fileUrl, fileName || null, mimeType || null, createdAt]
    );

    const document = {
      id,
      kindergarten_id: kindergartenId,
      document_name: documentName,
      file_url: fileUrl,
      file_name: fileName || null,
      mime_type: mimeType || null,
      created_at: createdAt,
    };
    await upsertArchiveFileRecord(kindergartenId, 'kindergarten', String(kindergartenId), 'kindergarten_archive_documents', document);
    res.status(201).json(decorateArchiveDocument(document));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.put('/archive/kindergarten-documents/:id', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const id = String(req.params.id || '').trim();
    const body = req.body || {};
    const documentName = String(body.document_name || '').trim();
    const fileUrl = String(body.file_url || '').trim();
    const fileName = String(body.file_name || '').trim();
    const mimeType = String(body.mime_type || '').trim();

    if (!id) return res.status(400).json({ error: 'Hujjat identifikatori topilmadi' });
    if (!documentName) return res.status(400).json({ error: 'Dokument nomi kiritilishi shart' });
    if (!fileUrl) return res.status(400).json({ error: 'Hujjat fayli yuklanishi shart' });

    const previous = await get<{ file_url: string }>(
      `SELECT file_url
       FROM kindergarten_archive_documents
       WHERE id = ? AND kindergarten_id = ?`,
      [id, kindergartenId]
    );

    await run(
      `UPDATE kindergarten_archive_documents
       SET document_name = ?, file_url = ?, file_name = ?, mime_type = ?
       WHERE id = ? AND kindergarten_id = ?`,
      [documentName, fileUrl, fileName || null, mimeType || null, id, kindergartenId]
    );

    const updated = await get(
      `SELECT id, kindergarten_id, document_name, file_url, file_name, mime_type, created_at
       FROM kindergarten_archive_documents
       WHERE id = ? AND kindergarten_id = ?`,
      [id, kindergartenId]
    );

    if (!updated) return res.status(404).json({ error: 'Hujjat topilmadi' });
    if (previous?.file_url && previous.file_url !== fileUrl) deleteArchivePhysicalFile(previous.file_url);
    await upsertArchiveFileRecord(kindergartenId, 'kindergarten', String(kindergartenId), 'kindergarten_archive_documents', updated as any);
    res.json(decorateArchiveDocument(updated as any));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.delete('/archive/kindergarten-documents/:id', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const id = String(req.params.id || '').trim();

    const existing = await get(
      `SELECT id, file_url
       FROM kindergarten_archive_documents
       WHERE id = ? AND kindergarten_id = ?`,
      [id, kindergartenId]
    );

    if (!existing) return res.status(404).json({ error: 'Hujjat topilmadi' });

    await run(
      `DELETE FROM kindergarten_archive_documents
       WHERE id = ? AND kindergarten_id = ?`,
      [id, kindergartenId]
    );
    await deleteArchiveFileRecord(kindergartenId, 'kindergarten', id);
    deleteArchivePhysicalFile(existing.file_url);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.get('/archive/children/:childId/documents', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const childId = String(req.params.childId || '').trim();
    const hiddenDocuments = await all(
      `SELECT document_id
       FROM archive_hidden_documents
       WHERE kindergarten_id = ? AND owner_type = ? AND owner_id = ?`,
      [kindergartenId, 'child', childId]
    ).catch(() => []);
    const hiddenDocumentIds = new Set(hiddenDocuments.map((document: any) => String(document.document_id)));

    const manualDocuments = await all(
      `SELECT id, kindergarten_id, child_id, category, document_name, file_url, file_name, mime_type, created_at, 'manual' as source
       FROM child_archive_documents
       WHERE kindergarten_id = ? AND child_id = ?
       ORDER BY created_at DESC`,
      [kindergartenId, childId]
    );
    const manualSingleCategories = new Set(
      manualDocuments
        .map((document: any) => String(document.category))
        .filter((category: string) => childSingleDocumentCategories.has(category))
    );

    const parentDocuments = await all(
      `SELECT id, child_id, title, type, file_url, created_at
       FROM parent_documents
       WHERE kindergarten_id = ? AND child_id = ?
       ORDER BY created_at DESC`,
      [kindergartenId, childId]
    ).catch(() => []);

    const child = await get<any>(
      `SELECT c.id, c.birth_certificate_number, c.passport_info, c.medical_notes, c.allergies,
              f.passport_no as father_passport,
              m.passport_no as mother_passport
       FROM children c
       LEFT JOIN parents f ON c.father_id = f.id
       LEFT JOIN parents m ON c.mother_id = m.id
       WHERE c.id = ? AND c.kindergarten_id = ?`,
      [childId, kindergartenId]
    );

    const normalizeParentDocumentCategory = (type: any) => {
      const normalized = String(type || '').toUpperCase();
      if (normalized === 'MEDICAL' || normalized === 'ALLERGY') return 'MEDICAL';
      if (normalized === 'PASSPORT') return 'BIRTH_CERTIFICATE';
      return 'OTHER';
    };

    const importedParentDocuments = parentDocuments.map((document: any) => ({
      id: `parent_${document.id}`,
      original_id: document.id,
      child_id: document.child_id,
      category: normalizeParentDocumentCategory(document.type),
      document_name: document.title || 'Ota-ona portali hujjati',
      file_url: document.file_url || '',
      file_name: document.title || null,
      mime_type: null,
      created_at: document.created_at,
      source: 'parent_portal',
      readonly: true,
    })).filter((document: any) => document.file_url && !hiddenDocumentIds.has(document.id) && !manualSingleCategories.has(document.category));

    const profileDocuments = child ? [
      child.father_passport ? {
        id: `profile_${childId}_father_passport`,
        child_id: childId,
        category: 'FATHER_PASSPORT',
        document_name: 'Otasining passporti',
        text_value: child.father_passport,
        file_url: '',
        file_name: null,
        mime_type: null,
        created_at: null,
        source: 'profile_data',
        readonly: true,
      } : null,
      child.mother_passport ? {
        id: `profile_${childId}_mother_passport`,
        child_id: childId,
        category: 'MOTHER_PASSPORT',
        document_name: 'Onasining passporti',
        text_value: child.mother_passport,
        file_url: '',
        file_name: null,
        mime_type: null,
        created_at: null,
        source: 'profile_data',
        readonly: true,
      } : null,
      child.birth_certificate_number ? {
        id: `profile_${childId}_birth_certificate`,
        child_id: childId,
        category: 'BIRTH_CERTIFICATE',
        document_name: "Tug'ilganlik guvohnomasi",
        text_value: child.birth_certificate_number,
        file_url: '',
        file_name: null,
        mime_type: null,
        created_at: null,
        source: 'profile_data',
        readonly: true,
      } : null,
      (child.medical_notes || child.allergies) ? {
        id: `profile_${childId}_medical`,
        child_id: childId,
        category: 'MEDICAL',
        document_name: 'Kasallik va allergiya',
        text_value: [child.medical_notes, child.allergies].filter(Boolean).join(' / '),
        file_url: '',
        file_name: null,
        mime_type: null,
        created_at: null,
        source: 'profile_data',
        readonly: true,
      } : null,
    ].filter(Boolean).filter((document: any) => !hiddenDocumentIds.has(document.id) && !manualSingleCategories.has(document.category)) : [];

    await Promise.all([
      ...manualDocuments.map((document: any) =>
        upsertArchiveFileRecord(kindergartenId, 'child', childId, 'child_archive_documents', document)
      ),
      ...importedParentDocuments.map((document: any) =>
        upsertArchiveFileRecord(kindergartenId, 'child', childId, 'parent_documents', document)
      ),
    ]);
    res.json([...manualDocuments, ...importedParentDocuments, ...profileDocuments].map(decorateArchiveDocument));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.post('/archive/children/:childId/documents', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const childId = String(req.params.childId || '').trim();
    const body = req.body || {};
    const category = String(body.category || '').trim();
    const documentName = String(body.document_name || '').trim();
    const fileUrl = String(body.file_url || '').trim();
    const fileName = String(body.file_name || '').trim();
    const mimeType = String(body.mime_type || '').trim();

    if (!childId) return res.status(400).json({ error: 'Bola identifikatori topilmadi' });
    if (!category) return res.status(400).json({ error: 'Hujjat turi tanlanishi shart' });
    if (!documentName) return res.status(400).json({ error: 'Dokument nomi kiritilishi shart' });
    if (!fileUrl) return res.status(400).json({ error: 'Hujjat fayli yuklanishi shart' });

    const child = await get(
      `SELECT id
       FROM children
       WHERE id = ? AND kindergarten_id = ?`,
      [childId, kindergartenId]
    );
    if (!child) return res.status(404).json({ error: 'Bola topilmadi' });

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await run(
      `INSERT INTO child_archive_documents
        (id, kindergarten_id, child_id, category, document_name, file_url, file_name, mime_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, kindergartenId, childId, category, documentName, fileUrl, fileName || null, mimeType || null, createdAt]
    );

    const document = {
      id,
      kindergarten_id: kindergartenId,
      child_id: childId,
      category,
      document_name: documentName,
      file_url: fileUrl,
      file_name: fileName || null,
      mime_type: mimeType || null,
      created_at: createdAt,
      source: 'manual',
    };
    await upsertArchiveFileRecord(kindergartenId, 'child', childId, 'child_archive_documents', document);
    res.status(201).json(decorateArchiveDocument(document));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.put('/archive/children/:childId/documents/:id', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const childId = String(req.params.childId || '').trim();
    const id = String(req.params.id || '').trim();
    const body = req.body || {};
    const category = String(body.category || '').trim();
    const documentName = String(body.document_name || '').trim();
    const fileUrl = String(body.file_url || '').trim();
    const fileName = String(body.file_name || '').trim();
    const mimeType = String(body.mime_type || '').trim();

    if (!category) return res.status(400).json({ error: 'Hujjat turi tanlanishi shart' });
    if (!documentName) return res.status(400).json({ error: 'Dokument nomi kiritilishi shart' });
    if (!fileUrl) return res.status(400).json({ error: 'Hujjat fayli yuklanishi shart' });

    const child = await get(
      `SELECT id
       FROM children
       WHERE id = ? AND kindergarten_id = ?`,
      [childId, kindergartenId]
    );
    if (!child) return res.status(404).json({ error: 'Bola topilmadi' });

    const previous = await get<{ file_url: string }>(
      `SELECT file_url
       FROM child_archive_documents
       WHERE id = ? AND child_id = ? AND kindergarten_id = ?`,
      [id, childId, kindergartenId]
    );

    await run(
      `UPDATE child_archive_documents
       SET category = ?, document_name = ?, file_url = ?, file_name = ?, mime_type = ?
       WHERE id = ? AND child_id = ? AND kindergarten_id = ?`,
      [category, documentName, fileUrl, fileName || null, mimeType || null, id, childId, kindergartenId]
    );

    const updated = await get(
      `SELECT id, kindergarten_id, child_id, category, document_name, file_url, file_name, mime_type, created_at, 'manual' as source
       FROM child_archive_documents
       WHERE id = ? AND child_id = ? AND kindergarten_id = ?`,
      [id, childId, kindergartenId]
    );
    if (!updated) return res.status(404).json({ error: 'Hujjat topilmadi' });
    if (previous?.file_url && previous.file_url !== fileUrl) deleteArchivePhysicalFile(previous.file_url);
    await upsertArchiveFileRecord(kindergartenId, 'child', childId, 'child_archive_documents', updated as any);
    res.json(decorateArchiveDocument(updated as any));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.delete('/archive/children/:childId/documents/:id', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const childId = String(req.params.childId || '').trim();
    const id = String(req.params.id || '').trim();

    const existing = await get(
      `SELECT id, file_url
       FROM child_archive_documents
       WHERE id = ? AND child_id = ? AND kindergarten_id = ?`,
      [id, childId, kindergartenId]
    );
    if (!existing) {
      await run(
        `INSERT INTO archive_hidden_documents
          (kindergarten_id, owner_type, owner_id, document_id, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (kindergarten_id, owner_type, owner_id, document_id) DO NOTHING`,
        [kindergartenId, 'child', childId, id, new Date().toISOString()]
      );
      return res.json({ success: true });
    }

    await run(
      `DELETE FROM child_archive_documents
       WHERE id = ? AND child_id = ? AND kindergarten_id = ?`,
      [id, childId, kindergartenId]
    );
    await deleteArchiveFileRecord(kindergartenId, 'child', id);
    deleteArchivePhysicalFile(existing.file_url);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.get('/archive/staff/:staffId/documents', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const staffId = String(req.params.staffId || '').trim();
    const hiddenDocuments = await all(
      `SELECT document_id
       FROM archive_hidden_documents
       WHERE kindergarten_id = ? AND owner_type = ? AND owner_id = ?`,
      [kindergartenId, 'staff', staffId]
    ).catch(() => []);
    const hiddenDocumentIds = new Set(hiddenDocuments.map((document: any) => String(document.document_id)));

    const manualDocuments = await all(
      `SELECT id, kindergarten_id, staff_id, category, document_name, file_url, file_name, mime_type, created_at, 'manual' as source
       FROM staff_archive_documents
       WHERE kindergarten_id = ? AND staff_id = ?
       ORDER BY created_at DESC`,
      [kindergartenId, staffId]
    );
    const manualSingleCategories = new Set(
      manualDocuments
        .map((document: any) => String(document.category))
        .filter((category: string) => staffSingleDocumentCategories.has(category))
    );

    const staff = await get<any>(
      `SELECT id, passport_no
       FROM staff
       WHERE id = ? AND kindergarten_id = ?`,
      [staffId, kindergartenId]
    );

    const profileDocuments = staff?.passport_no ? [{
      id: `profile_${staffId}_passport`,
      staff_id: staffId,
      category: 'PASSPORT',
      document_name: 'Passporti',
      text_value: staff.passport_no,
      file_url: '',
      file_name: null,
      mime_type: null,
      created_at: null,
      source: 'profile_data',
      readonly: true,
    }].filter((document: any) => !hiddenDocumentIds.has(document.id) && !manualSingleCategories.has(document.category)) : [];

    await Promise.all(manualDocuments.map((document: any) =>
      upsertArchiveFileRecord(kindergartenId, 'staff', staffId, 'staff_archive_documents', document)
    ));
    res.json([...manualDocuments, ...profileDocuments].map(decorateArchiveDocument));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.post('/archive/staff/:staffId/documents', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const staffId = String(req.params.staffId || '').trim();
    const body = req.body || {};
    const category = String(body.category || '').trim();
    const documentName = String(body.document_name || '').trim();
    const fileUrl = String(body.file_url || '').trim();
    const fileName = String(body.file_name || '').trim();
    const mimeType = String(body.mime_type || '').trim();

    if (!staffId) return res.status(400).json({ error: 'Xodim identifikatori topilmadi' });
    if (!category) return res.status(400).json({ error: 'Hujjat turi tanlanishi shart' });
    if (!documentName) return res.status(400).json({ error: 'Dokument nomi kiritilishi shart' });
    if (!fileUrl) return res.status(400).json({ error: 'Hujjat fayli yuklanishi shart' });

    const staffMember = await get(
      `SELECT id
       FROM staff
       WHERE id = ? AND kindergarten_id = ?`,
      [staffId, kindergartenId]
    );
    if (!staffMember) return res.status(404).json({ error: 'Xodim topilmadi' });

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await run(
      `INSERT INTO staff_archive_documents
        (id, kindergarten_id, staff_id, category, document_name, file_url, file_name, mime_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, kindergartenId, staffId, category, documentName, fileUrl, fileName || null, mimeType || null, createdAt]
    );

    const document = {
      id,
      kindergarten_id: kindergartenId,
      staff_id: staffId,
      category,
      document_name: documentName,
      file_url: fileUrl,
      file_name: fileName || null,
      mime_type: mimeType || null,
      created_at: createdAt,
      source: 'manual',
    };
    await upsertArchiveFileRecord(kindergartenId, 'staff', staffId, 'staff_archive_documents', document);
    res.status(201).json(decorateArchiveDocument(document));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.put('/archive/staff/:staffId/documents/:id', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const staffId = String(req.params.staffId || '').trim();
    const id = String(req.params.id || '').trim();
    const body = req.body || {};
    const category = String(body.category || '').trim();
    const documentName = String(body.document_name || '').trim();
    const fileUrl = String(body.file_url || '').trim();
    const fileName = String(body.file_name || '').trim();
    const mimeType = String(body.mime_type || '').trim();

    if (!category) return res.status(400).json({ error: 'Hujjat turi tanlanishi shart' });
    if (!documentName) return res.status(400).json({ error: 'Dokument nomi kiritilishi shart' });
    if (!fileUrl) return res.status(400).json({ error: 'Hujjat fayli yuklanishi shart' });

    const staffMember = await get(
      `SELECT id
       FROM staff
       WHERE id = ? AND kindergarten_id = ?`,
      [staffId, kindergartenId]
    );
    if (!staffMember) return res.status(404).json({ error: 'Xodim topilmadi' });

    const previous = await get<{ file_url: string }>(
      `SELECT file_url
       FROM staff_archive_documents
       WHERE id = ? AND staff_id = ? AND kindergarten_id = ?`,
      [id, staffId, kindergartenId]
    );

    await run(
      `UPDATE staff_archive_documents
       SET category = ?, document_name = ?, file_url = ?, file_name = ?, mime_type = ?
       WHERE id = ? AND staff_id = ? AND kindergarten_id = ?`,
      [category, documentName, fileUrl, fileName || null, mimeType || null, id, staffId, kindergartenId]
    );

    const updated = await get(
      `SELECT id, kindergarten_id, staff_id, category, document_name, file_url, file_name, mime_type, created_at, 'manual' as source
       FROM staff_archive_documents
       WHERE id = ? AND staff_id = ? AND kindergarten_id = ?`,
      [id, staffId, kindergartenId]
    );
    if (!updated) return res.status(404).json({ error: 'Hujjat topilmadi' });
    if (previous?.file_url && previous.file_url !== fileUrl) deleteArchivePhysicalFile(previous.file_url);
    await upsertArchiveFileRecord(kindergartenId, 'staff', staffId, 'staff_archive_documents', updated as any);
    res.json(decorateArchiveDocument(updated as any));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

archiveRoutes.delete('/archive/staff/:staffId/documents/:id', async (req, res) => {
  try {
    await ensureArchiveTables();
    const kindergartenId = await resolveKindergartenId(req);
    const staffId = String(req.params.staffId || '').trim();
    const id = String(req.params.id || '').trim();

    const existing = await get(
      `SELECT id, file_url
       FROM staff_archive_documents
       WHERE id = ? AND staff_id = ? AND kindergarten_id = ?`,
      [id, staffId, kindergartenId]
    );
    if (!existing) {
      await run(
        `INSERT INTO archive_hidden_documents
          (kindergarten_id, owner_type, owner_id, document_id, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (kindergarten_id, owner_type, owner_id, document_id) DO NOTHING`,
        [kindergartenId, 'staff', staffId, id, new Date().toISOString()]
      );
      return res.json({ success: true });
    }

    await run(
      `DELETE FROM staff_archive_documents
       WHERE id = ? AND staff_id = ? AND kindergarten_id = ?`,
      [id, staffId, kindergartenId]
    );
    await deleteArchiveFileRecord(kindergartenId, 'staff', id);
    deleteArchivePhysicalFile(existing.file_url);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
