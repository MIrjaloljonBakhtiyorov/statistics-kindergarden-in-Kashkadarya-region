import { Router } from 'express';
import crypto from 'crypto';
import { resolveKindergartenId } from '../requestContext.js';
import {
  all,
  get,
  run,
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
        run('ALTER TABLE role_accounts ADD COLUMN IF NOT EXISTS last_seen_at TEXT').catch(() => undefined),
      ]).then(() => undefined);
    }
    return promise;
  };
})();

const isDeletedMessage = (row: any) => row.is_deleted === true || row.is_deleted === 1 || row.is_deleted === '1';

const roleChannelId = (kindergartenId: string, role: 'nurse' | 'teacher') => `role_${role}_${kindergartenId}`;

const chatAliases = (kindergartenId: string, userId: string, role?: string) => {
  const aliases = new Set([String(userId)]);
  const normalizedRole = String(role || '').toLowerCase();
  if (String(userId).startsWith('staff_')) {
    aliases.add(String(kindergartenId));
  }
  if (normalizedRole === 'nurse') {
    aliases.add(roleChannelId(kindergartenId, 'nurse'));
  }
  if (normalizedRole === 'teacher') {
    aliases.add(roleChannelId(kindergartenId, 'teacher'));
  }
  return Array.from(aliases);
};

const mapMessage = (row: any, userIds: string[] | string = []) => {
  const viewerIds = Array.isArray(userIds) ? userIds : [userIds];
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
    type: viewerIds.length > 0 && viewerIds.includes(String(row.sender_id)) ? 'sent' : 'received',
    senderRole: row.sender_role || 'parent',
  };
};

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

const formatLastSeenStatus = (lastSeenAt?: string | null) => {
  if (!lastSeenAt) {
    return {
      isOnline: false,
      statusLabel: "Hali online bo'lmagan",
      lastSeenAt: null,
    };
  }

  const timestamp = new Date(lastSeenAt).getTime();
  if (!Number.isFinite(timestamp)) {
    return {
      isOnline: false,
      statusLabel: "Hali online bo'lmagan",
      lastSeenAt: null,
    };
  }

  const diffMs = Math.max(0, Date.now() - timestamp);
  if (diffMs <= ONLINE_WINDOW_MS) {
    return { isOnline: true, statusLabel: 'Online', lastSeenAt };
  }

  const minutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (minutes < 60) {
    return { isOnline: false, statusLabel: `${minutes} daqiqa oldin online edi`, lastSeenAt };
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return { isOnline: false, statusLabel: `${hours} soat oldin online edi`, lastSeenAt };
  }

  const days = Math.floor(hours / 24);
  return { isOnline: false, statusLabel: `${days} kun oldin online edi`, lastSeenAt };
};

messagesRoutes.get("/messages", async (req, res) => {
  try {
    await ensureMessageColumns();
    const kindergartenId = await resolveKindergartenId(req);
    const rawUserId = String(req.query.userId || '');
    const rawContactId = String(req.query.contactId || '');
    const userRole = String(req.query.userRole || '');
    const contactRole = String(req.query.contactRole || '');
    const userId = await resolveChatUserId(kindergartenId, rawUserId, userRole);
    const contactId = await resolveChatUserId(kindergartenId, rawContactId, contactRole);
    const userIds = chatAliases(kindergartenId, userId, userRole);
    const contactIds = chatAliases(kindergartenId, contactId, contactRole || (String(contactId).startsWith('staff_') ? 'TEACHER' : ''));
    const userPlaceholders = userIds.map(() => '?').join(', ');
    const contactPlaceholders = contactIds.map(() => '?').join(', ');
    const rows = await all(`
      SELECT * FROM messages
      WHERE kindergarten_id = ?
        AND (
          (sender_id IN (${userPlaceholders}) AND receiver_id IN (${contactPlaceholders}))
          OR (sender_id IN (${contactPlaceholders}) AND receiver_id IN (${userPlaceholders}))
        )
      ORDER BY created_at ASC
    `, [kindergartenId, ...userIds, ...contactIds, ...contactIds, ...userIds]);

    res.json(rows.map((row: any) => mapMessage(row, userIds)));
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
      SELECT c.id, c.first_name, c.last_name, c.group_id, g.teacher_id, g.teacher_name,
             k.name as kindergarten_name, k.directorName as director_name, k.username as director_login
      FROM children c
      LEFT JOIN groups g ON g.id = c.group_id AND g.kindergarten_id = c.kindergarten_id
      LEFT JOIN kindergartens k ON k.id = c.kindergarten_id
      WHERE c.kindergarten_id = ? AND c.parent_account_id = ?
        AND (? = '' OR c.id = ?)
      LIMIT 1
    `, [kindergartenId, parentId, childId, childId]);

    if (!child) return res.json([]);

    const teacherId = child?.teacher_id || '';
    const teacherName = child?.teacher_name || '';
    const groupId = child?.group_id || '';
    const childFullName = `${child?.first_name || ''} ${child?.last_name || ''}`.replace(/\s+/g, ' ').trim().toLowerCase();

    const contactStats = async (contact: any) => {
      const contactIds = chatAliases(kindergartenId, String(contact.id), contact.role);
      const contactPlaceholders = contactIds.map(() => '?').join(', ');
      const unread = await get<any>(`
        SELECT COUNT(*) as unread_count
        FROM messages
        WHERE kindergarten_id = ? AND sender_id IN (${contactPlaceholders}) AND receiver_id = ?
          AND status != 'read' AND COALESCE(is_deleted, 0) = 0
      `, [kindergartenId, ...contactIds, parentId]);

      const latest = await get<any>(`
        SELECT text, created_at
        FROM messages
        WHERE kindergarten_id = ?
          AND (
            (sender_id IN (${contactPlaceholders}) AND receiver_id = ?)
            OR (sender_id = ? AND receiver_id IN (${contactPlaceholders}))
          )
          AND COALESCE(is_deleted, 0) = 0
        ORDER BY created_at DESC
        LIMIT 1
      `, [kindergartenId, ...contactIds, parentId, parentId, ...contactIds]);

      const presence = contact.hasSystemAccount || contact.last_seen_at
        ? formatLastSeenStatus(contact.last_seen_at || latest?.created_at)
        : {
          isOnline: false,
          statusLabel: latest?.created_at ? 'Xabar yuborilgan' : 'Xabar yuborish mumkin',
          lastSeenAt: null,
        };

      return {
        unreadCount: Number(unread?.unread_count || 0),
        lastMessage: latest?.text || '',
        isOnline: presence.isOnline,
        lastSeenAt: presence.lastSeenAt,
        statusLabel: presence.statusLabel,
      };
    };

    const leaderCandidates = await all<any>(`
      SELECT
        id,
        full_name,
        role,
        last_seen_at,
        source,
        sort_priority
      FROM (
        SELECT
          ra.id,
          COALESCE(NULLIF(ra.full_name, ''), ra.login) as full_name,
          'TEACHER' as role,
          ra.last_seen_at,
          'role_account' as source,
          CASE
            WHEN (? != '' AND ra.id = ?) THEN 0
            WHEN (? != '' AND LOWER(COALESCE(ra.full_name, '')) = LOWER(?)) THEN 3
            ELSE 4
          END as sort_priority
        FROM role_accounts ra
        WHERE ra.kindergarten_id = ? AND ra.role = 'TEACHER'
          AND (
            (? != '' AND ra.id = ?)
            OR (? != '' AND LOWER(COALESCE(ra.full_name, '')) = LOWER(?))
          )

        UNION ALL

        SELECT
          s.id,
          s.full_name,
          'TEACHER' as role,
          NULL as last_seen_at,
          'staff' as source,
          CASE
            WHEN (? != '' AND s.id = ?) THEN 0
            WHEN (? != '' AND s.group_id = ?) THEN 1
            WHEN (? != '' AND LOWER(COALESCE(s.full_name, '')) = LOWER(?)) THEN 3
            ELSE 5
          END as sort_priority
        FROM staff s
        WHERE s.kindergarten_id = ?
          AND (
            (? != '' AND s.id = ?)
            OR (? != '' AND LOWER(COALESCE(s.full_name, '')) = LOWER(?))
            OR (? != '' AND s.group_id = ?)
          )
      ) leader
      ORDER BY sort_priority, source, full_name
      LIMIT 1
    `, [
      teacherId, teacherId,
      teacherName, teacherName,
      kindergartenId,
      teacherId, teacherId,
      teacherName, teacherName,
      teacherId, teacherId,
      groupId, groupId,
      teacherName, teacherName,
      kindergartenId,
      teacherId, teacherId,
      teacherName, teacherName,
      groupId, groupId,
    ]);

    let leader = leaderCandidates[0];

    if (leader && childFullName && String(leader.full_name || '').replace(/\s+/g, ' ').trim().toLowerCase() === childFullName) {
      leader = undefined;
    }

    if (!leader && (teacherName || groupId) && (!childFullName || String(teacherName || '').replace(/\s+/g, ' ').trim().toLowerCase() !== childFullName)) {
      leader = await get<any>(`
        SELECT
          ra.id,
          COALESCE(NULLIF(?, ''), NULLIF(ra.full_name, ''), ra.login) as full_name,
          'TEACHER' as role,
          ra.last_seen_at,
          'role_account' as source,
          9 as sort_priority
        FROM role_accounts ra
        WHERE ra.kindergarten_id = ? AND ra.role = 'TEACHER'
        ORDER BY ra.created_at DESC
        LIMIT 1
      `, [teacherName, kindergartenId]).catch(() => undefined);
    }

    if (leader && childFullName && String(leader.full_name || teacherName || '').replace(/\s+/g, ' ').trim().toLowerCase() === childFullName) {
      leader = undefined;
    }

    const nurse = await get<any>(`
      SELECT id, COALESCE(NULLIF(full_name, ''), login) as full_name, role, last_seen_at, 'role_account' as source
      FROM role_accounts
      WHERE kindergarten_id = ? AND role = 'NURSE'
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 1
    `, [kindergartenId]).catch(() => undefined);

    const rawContacts = [
      {
        id: String(kindergartenId),
        name: child.director_name || child.kindergarten_name || 'MTT direktori',
        role: 'director',
        title: 'MTT direktori',
        subtitle: 'Bogʼcha boshqaruvi',
        hasSystemAccount: true,
        source: 'kindergarten',
      },
      {
        id: nurse?.id ? String(nurse.id) : roleChannelId(kindergartenId, 'nurse'),
        name: nurse?.full_name || 'Hamshira',
        role: 'nurse',
        title: 'Hamshira',
        subtitle: 'Tibbiy nazorat',
        last_seen_at: nurse?.last_seen_at,
        hasSystemAccount: nurse?.source === 'role_account',
        source: nurse?.source || 'role_channel',
      },
      {
        id: leader?.id ? String(leader.id) : roleChannelId(kindergartenId, 'teacher'),
        name: leader?.full_name || teacherName || 'Guruh tarbiyachisi',
        role: 'teacher',
        title: 'Guruh tarbiyachisi',
        subtitle: 'Guruh rahbari',
        last_seen_at: leader?.last_seen_at,
        hasSystemAccount: leader?.source === 'role_account',
        isGroupLeader: Boolean(leader),
        source: leader?.source || 'role_channel',
      },
    ].filter(Boolean) as any[];

    const contacts = await Promise.all(rawContacts.map(async (contact) => ({
      id: contact.id,
      name: contact.name,
      role: contact.role,
      title: contact.title,
      subtitle: contact.subtitle,
      hasSystemAccount: contact.hasSystemAccount,
      isGroupLeader: Boolean(contact.isGroupLeader),
      ...(await contactStats(contact)),
    })));

    res.json(contacts);
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
    const userIds = chatAliases(kindergartenId, userId, req.body.userRole);
    const contactIds = chatAliases(kindergartenId, contactId, req.body.contactRole);
    const userPlaceholders = userIds.map(() => '?').join(', ');
    const contactPlaceholders = contactIds.map(() => '?').join(', ');
    await run(`
      UPDATE messages
      SET status = 'read'
      WHERE kindergarten_id = ?
        AND sender_id IN (${contactPlaceholders})
        AND receiver_id IN (${userPlaceholders})
        AND COALESCE(is_deleted, 0) = 0
    `, [
      kindergartenId,
      ...contactIds,
      ...userIds,
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

