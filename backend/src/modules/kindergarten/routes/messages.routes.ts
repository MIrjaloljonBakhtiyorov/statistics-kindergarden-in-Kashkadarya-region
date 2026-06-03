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

messagesRoutes.get("/messages", async (req, res) => {
  try {
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

    res.json(rows.map((row: any) => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      text: row.text,
      messageType: row.message_type || 'text',
      fileUrl: row.file_url || null,
      fileName: row.file_name || null,
      mimeType: row.mime_type || null,
      time: row.created_at,
      status: row.status || 'sent',
      type: row.sender_id === userId ? 'sent' : 'received',
      senderRole: row.sender_role || 'parent',
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.post("/messages", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const id = crypto.randomUUID();
    const messageType = req.body.messageType || (req.body.fileUrl ? 'file' : 'text');
    const senderId = await resolveChatUserId(kindergartenId, String(req.body.senderId || ''), req.body.senderRole);
    const receiverId = await resolveChatUserId(kindergartenId, String(req.body.receiverId || ''), req.body.receiverRole);
    await run(`
      INSERT INTO messages
        (id, kindergarten_id, sender_id, receiver_id, text, message_type, file_url, file_name, mime_type, sender_role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      kindergartenId,
      senderId,
      receiverId,
      req.body.text || '',
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
      text: req.body.text || '',
      messageType,
      fileUrl: req.body.fileUrl || null,
      fileName: req.body.fileName || null,
      mimeType: req.body.mimeType || null,
      time: new Date().toISOString(),
      status: 'sent',
      type: 'sent',
      senderRole: req.body.senderRole,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.get("/messages/contacts", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const parentId = String(req.query.parentId || '');
    const staff = await all(`
      SELECT
        ra.id,
        COALESCE(NULLIF(ra.full_name, ''), ra.login) as full_name,
        ra.role,
        COALESCE(unread.unread_count, 0) as unread_count,
        latest.text as last_message
      FROM role_accounts ra
      LEFT JOIN (
        SELECT sender_id, COUNT(*) as unread_count
        FROM messages
        WHERE kindergarten_id = ? AND receiver_id = ? AND status != 'read'
        GROUP BY sender_id
      ) unread ON unread.sender_id = ra.id
      LEFT JOIN LATERAL (
        SELECT text
        FROM messages m
        WHERE m.kindergarten_id = ra.kindergarten_id
          AND ((m.sender_id = ra.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ra.id))
        ORDER BY m.created_at DESC
        LIMIT 1
      ) latest ON true
      WHERE ra.kindergarten_id = ? AND ra.role IN ('TEACHER', 'OPERATOR', 'DIRECTOR')
      ORDER BY CASE WHEN ra.role = 'TEACHER' THEN 0 ELSE 1 END, full_name
    `, [kindergartenId, parentId, parentId, parentId, kindergartenId]);
    res.json(staff.map((row: any) => ({
      id: row.id,
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
    const kindergartenId = await resolveKindergartenId(req);
    const userId = await resolveChatUserId(kindergartenId, String(req.query.userId || ''), String(req.query.userRole || ''));
    const rows = await all(`
      SELECT sender_id, COUNT(*) as count FROM messages
      WHERE kindergarten_id = ? AND receiver_id = ? AND status != 'read'
      GROUP BY sender_id
    `, [kindergartenId, userId]);
    res.json(Object.fromEntries(rows.map((row: any) => [row.sender_id, row.count])));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.put("/messages/read", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const userId = await resolveChatUserId(kindergartenId, String(req.body.userId || ''), req.body.userRole);
    const contactId = await resolveChatUserId(kindergartenId, String(req.body.contactId || ''), req.body.contactRole);
    await run(`UPDATE messages SET status = 'read' WHERE kindergarten_id = ? AND sender_id = ? AND receiver_id = ?`, [
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

