import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { resolveKindergartenId } from '../requestContext.js';
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

export const messagesRoutes = Router();

const ensureMessageColumns = (() => {
  let promise: Promise<void> | null = null;
  return () => {
    if (!promise) {
      promise = Promise.all([
        run('ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TEXT').catch(() => undefined),
        run('ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TEXT').catch(() => undefined),
        run('ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted INTEGER DEFAULT 0').catch(() => undefined),
      ]).then(() => undefined);
    }
    return promise;
  };
})();

const isDeletedMessage = (row: any) => row.is_deleted === true || row.is_deleted === 1 || row.is_deleted === '1';

const mapMessage = (row: any, userId?: string) => {
  const deleted = isDeletedMessage(row);
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    text: deleted ? '' : row.text,
    messageType: deleted ? 'text' : (row.message_type || 'text'),
    fileUrl: deleted ? null : (row.file_url || null),
    fileName: deleted ? null : (row.file_name || null),
    mimeType: deleted ? null : (row.mime_type || null),
    time: row.created_at,
    editedAt: row.edited_at || null,
    deletedAt: row.deleted_at || null,
    isDeleted: deleted,
    status: row.status || 'sent',
    type: userId ? (row.sender_id === userId ? 'sent' : 'received') : 'sent',
    senderRole: row.sender_role || 'parent',
  };
};

messagesRoutes.get("/messages", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const rawUserId = String(req.query.userId || '');
    const rawContactId = String(req.query.contactId || '');
    const userId = await resolveChatUserId(kindergartenId, rawUserId, String(req.query.userRole || ''));
    const contactId = await resolveChatUserId(kindergartenId, rawContactId, String(req.query.contactRole || ''));
    const rows = await all(`
      SELECT * FROM messages
      WHERE kindergarten_id = ?
        AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      ORDER BY created_at ASC
    `, [kindergartenId, userId, contactId, contactId, userId]);

    res.json(rows.map((row: any) => mapMessage(row, userId)));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.post("/messages", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const id = crypto.randomUUID();
    const messageType = req.body.messageType || (req.body.fileUrl ? 'file' : 'text');
    const senderId = await resolveChatUserId(kindergartenId, String(req.body.senderId || ''), req.body.senderRole);
    const receiverId = await resolveChatUserId(kindergartenId, String(req.body.receiverId || ''), req.body.receiverRole);
    const text = String(req.body.text || '').trim();

    if (!text && !req.body.fileUrl) {
      return res.status(400).json({ error: 'Xabar matni yoki fayl kiritilishi kerak' });
    }

    await run(`
      INSERT INTO messages
        (id, kindergarten_id, sender_id, receiver_id, text, message_type, file_url, file_name, mime_type, sender_role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      kindergartenId,
      senderId,
      receiverId,
      text,
      messageType,
      req.body.fileUrl || null,
      req.body.fileName || null,
      req.body.mimeType || null,
      req.body.senderRole,
      'sent',
    ]);
    res.status(201).json({
      id,
      senderId,
      receiverId,
      text,
      messageType,
      fileUrl: req.body.fileUrl || null,
      fileName: req.body.fileName || null,
      mimeType: req.body.mimeType || null,
      time: new Date().toISOString(),
      status: 'sent',
      type: 'sent',
      senderRole: req.body.senderRole,
      editedAt: null,
      deletedAt: null,
      isDeleted: false,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.get("/messages/contacts", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const parentId = String(req.query.parentId || '');
    const childId = String(req.query.childId || '');
    const child = await get<any>(`
      SELECT c.id, c.group_id, g.teacher_id, g.teacher_name
      FROM children c
      LEFT JOIN groups g ON g.id = c.group_id AND g.kindergarten_id = c.kindergarten_id
      WHERE c.kindergarten_id = ? AND c.parent_account_id = ?
        AND (? = '' OR c.id = ?)
      LIMIT 1
    `, [kindergartenId, parentId, childId, childId]);
    const teacherId = child?.teacher_id || '';
    const teacherName = child?.teacher_name || '';
    const roleContacts = await all(`
      SELECT
        ra.id,
        COALESCE(NULLIF(ra.full_name, ''), ra.login) as full_name,
        ra.role,
        COALESCE(unread.unread_count, 0) as unread_count,
        latest.text as last_message,
        CASE
          WHEN (? != '' AND ra.id = ?) THEN 0
          WHEN (? != '' AND LOWER(COALESCE(ra.full_name, '')) = LOWER(?)) THEN 0
          WHEN ra.role = 'TEACHER' THEN 1
          ELSE 2
        END as sort_priority
      FROM role_accounts ra
      LEFT JOIN (
        SELECT sender_id, COUNT(*) as unread_count
        FROM messages
        WHERE kindergarten_id = ? AND receiver_id = ? AND status != 'read' AND COALESCE(is_deleted, 0) = 0
        GROUP BY sender_id
      ) unread ON unread.sender_id = ra.id
      LEFT JOIN LATERAL (
        SELECT text
        FROM messages m
        WHERE m.kindergarten_id = ra.kindergarten_id
          AND ((m.sender_id = ra.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ra.id))
          AND COALESCE(m.is_deleted, 0) = 0
        ORDER BY m.created_at DESC
        LIMIT 1
      ) latest ON true
      WHERE ra.kindergarten_id = ? AND ra.role IN ('TEACHER', 'OPERATOR', 'DIRECTOR')
      ORDER BY sort_priority, full_name
    `, [teacherId, teacherId, teacherName, teacherName, kindergartenId, parentId, parentId, parentId, kindergartenId]);

    const staffContacts = await all(`
      SELECT
        s.id,
        s.full_name,
        'TEACHER' as role,
        COALESCE(unread.unread_count, 0) as unread_count,
        latest.text as last_message,
        CASE
          WHEN (? != '' AND s.id = ?) THEN 0
          WHEN (? != '' AND LOWER(COALESCE(s.full_name, '')) = LOWER(?)) THEN 0
          ELSE 1
        END as sort_priority
      FROM staff s
      LEFT JOIN (
        SELECT sender_id, COUNT(*) as unread_count
        FROM messages
        WHERE kindergarten_id = ? AND receiver_id = ? AND status != 'read' AND COALESCE(is_deleted, 0) = 0
        GROUP BY sender_id
      ) unread ON unread.sender_id = s.id
      LEFT JOIN LATERAL (
        SELECT text
        FROM messages m
        WHERE m.kindergarten_id = s.kindergarten_id
          AND ((m.sender_id = s.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = s.id))
          AND COALESCE(m.is_deleted, 0) = 0
        ORDER BY m.created_at DESC
        LIMIT 1
      ) latest ON true
      WHERE s.kindergarten_id = ?
        AND (
          (? != '' AND s.id = ?)
          OR (? != '' AND s.group_id = ?)
          OR (? != '' AND LOWER(COALESCE(s.full_name, '')) = LOWER(?))
          OR (? = '' AND ? = '' AND (
            LOWER(COALESCE(s.position, '')) LIKE '%educator%'
            OR LOWER(COALESCE(s.position, '')) LIKE '%tarbiyachi%'
          ))
        )
      ORDER BY sort_priority, full_name
    `, [
      teacherId, teacherId,
      teacherName, teacherName,
      kindergartenId, parentId,
      parentId, parentId,
      kindergartenId,
      teacherId, teacherId,
      child?.group_id || '', child?.group_id || '',
      teacherName, teacherName,
      teacherId, child?.group_id || '',
    ]);

    const director = await get<any>(`
      SELECT
        CAST(k.id AS TEXT) as id,
        COALESCE(NULLIF(k.directorname, ''), k.username, k.name) as full_name,
        'DIRECTOR' as role,
        COALESCE(unread.unread_count, 0) as unread_count,
        latest.text as last_message
      FROM kindergartens k
      LEFT JOIN (
        SELECT sender_id, COUNT(*) as unread_count
        FROM messages
        WHERE kindergarten_id = ? AND receiver_id = ? AND status != 'read' AND COALESCE(is_deleted, 0) = 0
        GROUP BY sender_id
      ) unread ON unread.sender_id = CAST(k.id AS TEXT)
      LEFT JOIN LATERAL (
        SELECT text
        FROM messages m
        WHERE m.kindergarten_id = CAST(k.id AS TEXT)
          AND ((m.sender_id = CAST(k.id AS TEXT) AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = CAST(k.id AS TEXT)))
          AND COALESCE(m.is_deleted, 0) = 0
        ORDER BY m.created_at DESC
        LIMIT 1
      ) latest ON true
      WHERE CAST(k.id AS TEXT) = ?
      LIMIT 1
    `, [kindergartenId, parentId, parentId, parentId, kindergartenId]).catch(() => undefined);

    const contactsById = new Map<string, any>();
    [...roleContacts, ...staffContacts, ...(director ? [director] : [])].forEach((row: any) => {
      if (!row?.id || contactsById.has(String(row.id))) return;
      contactsById.set(String(row.id), row);
    });

    res.json(Array.from(contactsById.values()).map((row: any) => ({
      id: String(row.id),
      name: row.full_name,
      role: row.role === 'TEACHER' ? 'teacher' : 'admin',
      unreadCount: Number(row.unread_count || 0),
      lastMessage: row.last_message || '',
      isOnline: true,
    })));
  } catch (error: any) {
    console.error('Error loading message contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.get("/messages/unread-counts", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const userId = await resolveChatUserId(kindergartenId, String(req.query.userId || ''), String(req.query.userRole || ''));
    const rows = await all(`
      SELECT sender_id, COUNT(*) as count FROM messages
      WHERE kindergarten_id = ? AND receiver_id = ? AND status != 'read' AND COALESCE(is_deleted, 0) = 0
      GROUP BY sender_id
    `, [kindergartenId, userId]);
    res.json(Object.fromEntries(rows.map((row: any) => [row.sender_id, row.count])));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.put("/messages/read", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const userId = await resolveChatUserId(kindergartenId, String(req.body.userId || ''), req.body.userRole);
    const contactId = await resolveChatUserId(kindergartenId, String(req.body.contactId || ''), req.body.contactRole);
    await run(`UPDATE messages SET status = 'read' WHERE kindergarten_id = ? AND sender_id = ? AND receiver_id = ? AND COALESCE(is_deleted, 0) = 0`, [
      kindergartenId,
      contactId,
      userId,
    ]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.post("/messages/broadcast", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const senderId = await resolveChatUserId(kindergartenId, String(req.body.senderId || ''), req.body.senderRole);
    for (const receiverId of req.body.receiverIds || []) {
      const chatReceiverId = await resolveChatUserId(kindergartenId, String(receiverId), req.body.receiverRole);
      await run('INSERT INTO messages (id, kindergarten_id, sender_id, receiver_id, text, message_type, sender_role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        crypto.randomUUID(),
        kindergartenId,
        senderId,
        chatReceiverId,
        req.body.text || '',
        'text',
        req.body.senderRole,
        'sent',
      ]);
    }
    res.status(201).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.put("/messages/:id", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const userId = await resolveChatUserId(kindergartenId, String(req.body.userId || req.body.senderId || ''), req.body.userRole || req.body.senderRole);
    const text = String(req.body.text || '').trim();

    if (!text) {
      return res.status(400).json({ error: 'Xabar matni kiritilishi kerak' });
    }

    const message = await get<any>(
      'SELECT * FROM messages WHERE id = ? AND kindergarten_id = ?',
      [req.params.id, kindergartenId]
    );

    if (!message) return res.status(404).json({ error: 'Xabar topilmadi' });
    if (message.sender_id !== userId) return res.status(403).json({ error: 'Faqat o‘z xabaringizni tahrirlashingiz mumkin' });
    if (isDeletedMessage(message)) return res.status(400).json({ error: 'O‘chirilgan xabarni tahrirlab bo‘lmaydi' });

    const editedAt = new Date().toISOString();
    await run(
      'UPDATE messages SET text = ?, edited_at = ? WHERE id = ? AND kindergarten_id = ?',
      [text, editedAt, req.params.id, kindergartenId]
    );

    res.json(mapMessage({ ...message, text, edited_at: editedAt }, userId));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.delete("/messages/:id", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const userId = await resolveChatUserId(kindergartenId, String(req.body.userId || req.body.senderId || ''), req.body.userRole || req.body.senderRole);
    const message = await get<any>(
      'SELECT * FROM messages WHERE id = ? AND kindergarten_id = ?',
      [req.params.id, kindergartenId]
    );

    if (!message) return res.status(404).json({ error: 'Xabar topilmadi' });
    if (message.sender_id !== userId) return res.status(403).json({ error: 'Faqat o‘z xabaringizni o‘chirishingiz mumkin' });

    const deletedAt = new Date().toISOString();
    await run(
      `UPDATE messages
       SET is_deleted = 1, deleted_at = ?, text = '', file_url = NULL, file_name = NULL, mime_type = NULL, message_type = 'text'
       WHERE id = ? AND kindergarten_id = ?`,
      [deletedAt, req.params.id, kindergartenId]
    );

    res.json(mapMessage({
      ...message,
      text: '',
      file_url: null,
      file_name: null,
      mime_type: null,
      message_type: 'text',
      is_deleted: 1,
      deleted_at: deletedAt,
    }, userId));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

