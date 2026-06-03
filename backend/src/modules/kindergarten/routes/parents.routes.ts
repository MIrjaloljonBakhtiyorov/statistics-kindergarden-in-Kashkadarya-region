import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { resolveKindergartenId } from '../requestContext.js';
import { db } from '../db.js';
import { assertLoginAvailable } from '../../shared/loginUniqueness.js';
import {
  all,
  get,
  run,
  ensureTables,
  parseJson,
  toPositiveNumber,
  normalizeIsoDate,
  isHealthCheckDue,
  normalizeArchiveMonths,
  getArchiveCutoffDate,
  getKindergartenChildCount,
  ensureMedicalInventoryDefaults,
  getMedicalItemStock,
  decorateMedicalItems,
  logOperation,
  resolveMedicalOutDetails,
  resolveChatUserId,
} from './routeSupport.js';

export const parentsRoutes = Router();

parentsRoutes.get("/parents", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all(`
      SELECT c.id as child_id, c.first_name, c.last_name, c.birth_certificate_number, c.group_id,
             pa.id as account_id, pa.login,
             g.name as group_name,
             f.full_name as father_name, f.phone as father_phone, f.passport_no as father_passport,
             m.full_name as mother_name, m.phone as mother_phone, m.passport_no as mother_passport
      FROM children c
      LEFT JOIN parent_accounts pa ON c.parent_account_id = pa.id
      LEFT JOIN groups g ON c.group_id = g.id
      LEFT JOIN parents f ON c.father_id = f.id
      LEFT JOIN parents m ON c.mother_id = m.id
      WHERE c.kindergarten_id = ?
      ORDER BY c.created_at DESC
    `, [kindergartenId]);

    res.json(rows.map((row: any) => ({
      id: row.account_id || row.child_id,
      childName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      childBirthCertificate: row.birth_certificate_number,
      fatherName: row.father_name,
      fatherPhone: row.father_phone,
      fatherPassport: row.father_passport,
      motherName: row.mother_name,
      motherPhone: row.mother_phone,
      motherPassport: row.mother_passport,
      childGroup: row.group_name,
      groupId: row.group_id,
      login: row.login,
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.put("/parents/:id", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const updates: string[] = [];
    const params: any[] = [];

    if (req.body.login) {
      const login = await assertLoginAvailable(db, req.body.login, { excludeParentAccountId: req.params.id });
      updates.push('login = ?');
      params.push(login);
    }

    if (req.body.password) {
      updates.push('password_hash = ?');
      params.push(await bcrypt.hash(req.body.password, 10));
    }

    if (updates.length === 0) {
      return res.json({ success: true });
    }

    params.push(req.params.id, kindergartenId);
    const result = await run(`UPDATE parent_accounts SET ${updates.join(', ')} WHERE id = ? AND kindergarten_id = ?`, params);
    if (result.changes === 0) return res.status(404).json({ error: 'Parent account not found' });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.delete("/parents/:id", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    await run('UPDATE children SET parent_account_id = NULL WHERE parent_account_id = ? AND kindergarten_id = ?', [req.params.id, kindergartenId]);
    await run('DELETE FROM parent_accounts WHERE id = ? AND kindergarten_id = ?', [req.params.id, kindergartenId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.get("/parent-portal/child-info/:childId", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const row = await get(`
      SELECT c.*, g.name as childGroup,
             k.name as kindergartenName, k.district as kindergartenDistrict, k.address as kindergartenAddress,
             f.full_name as fatherName, f.phone as fatherPhone, f.passport_no as fatherPassport, f.workplace as fatherWorkplace,
             m.full_name as motherName, m.phone as motherPhone, m.passport_no as motherPassport, m.workplace as motherWorkplace
      FROM children c
      LEFT JOIN groups g ON c.group_id = g.id
      LEFT JOIN kindergartens k ON k.id = c.kindergarten_id
      LEFT JOIN parents f ON c.father_id = f.id
      LEFT JOIN parents m ON c.mother_id = m.id
      WHERE c.id = ? AND c.kindergarten_id = ?
    `, [req.params.childId, kindergartenId]);
    if (!row) return res.status(404).json({ error: 'Child not found' });
    res.json(row);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.get("/parent-portal/full-data/:childId", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const today = new Date().toISOString().slice(0, 10);
    const [attendance, health, documents, pickups, menu] = await Promise.all([
      all('SELECT * FROM attendance WHERE child_id = ? AND kindergarten_id = ? ORDER BY date DESC LIMIT 30', [req.params.childId, kindergartenId]),
      all('SELECT * FROM health_checks WHERE child_id = ? AND kindergarten_id = ? ORDER BY date DESC LIMIT 20', [req.params.childId, kindergartenId]),
      all('SELECT * FROM parent_documents WHERE child_id = ? AND kindergarten_id = ? ORDER BY created_at DESC', [req.params.childId, kindergartenId]),
      all('SELECT * FROM pickup_people WHERE child_id = ? AND kindergarten_id = ? ORDER BY created_at DESC', [req.params.childId, kindergartenId]),
      all('SELECT * FROM menus WHERE kindergarten_id = ? AND date = ? ORDER BY meal_type', [kindergartenId, today]),
    ]);
    res.json({ attendance, health, documents, pickups, menu, finance: [], progress: [], vaccines: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.put("/parent-portal/profile/:childId", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    await run('UPDATE children SET address = ?, photo_url = ? WHERE id = ? AND kindergarten_id = ?', [
      req.body.address || null,
      req.body.photo_url || null,
      req.params.childId,
      kindergartenId,
    ]);

    const child = await get<any>('SELECT father_id, mother_id FROM children WHERE id = ? AND kindergarten_id = ?', [req.params.childId, kindergartenId]);
    if (child?.father_id && req.body.father) {
      await run('UPDATE parents SET workplace = ?, phone = ?, passport_no = ? WHERE id = ? AND kindergarten_id = ?', [
        req.body.father.workplace || null,
        req.body.father.phone || null,
        req.body.father.passport_no || null,
        child.father_id,
        kindergartenId,
      ]);
    }
    if (child?.mother_id && req.body.mother) {
      await run('UPDATE parents SET workplace = ?, phone = ?, passport_no = ? WHERE id = ? AND kindergarten_id = ?', [
        req.body.mother.workplace || null,
        req.body.mother.phone || null,
        req.body.mother.passport_no || null,
        child.mother_id,
        kindergartenId,
      ]);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.get("/parent-portal/menu/:childId/:date", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all('SELECT * FROM menus WHERE kindergarten_id = ? AND date = ? ORDER BY meal_type', [kindergartenId, req.params.date]);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.post("/parent-portal/documents", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const id = crypto.randomUUID();
    await run('INSERT INTO parent_documents (id, kindergarten_id, child_id, title, type, file_url) VALUES (?, ?, ?, ?, ?, ?)', [
      id,
      kindergartenId,
      req.body.child_id,
      req.body.title,
      req.body.type,
      req.body.file_url,
    ]);
    res.status(201).json({ id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.post("/parent-portal/pickups", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const id = crypto.randomUUID();
    await run('INSERT INTO pickup_people (id, kindergarten_id, child_id, full_name, relation, phone, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      id,
      kindergartenId,
      req.body.child_id,
      req.body.full_name,
      req.body.relation,
      req.body.phone,
      req.body.photo_url || null,
    ]);
    res.status(201).json({ id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

parentsRoutes.delete("/parent-portal/pickups/:id", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    await run('DELETE FROM pickup_people WHERE id = ? AND kindergarten_id = ?', [req.params.id, kindergartenId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

