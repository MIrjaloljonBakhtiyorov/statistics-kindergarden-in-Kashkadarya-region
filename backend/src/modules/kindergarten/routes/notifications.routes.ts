import { Router } from 'express';

import { resolveKindergartenId } from '../requestContext.js';
import { all, run } from './routeSupport.js';

export const notificationsRoutes = Router();

const normalizeRole = (value: any) => String(value || '').trim().toUpperCase();
const normalizeUserId = (value: any) => String(value || '').trim();

notificationsRoutes.get('/notifications', async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const role = normalizeRole(req.query.role);
    const userId = normalizeUserId(req.query.userId);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    if (!role) return res.status(400).json({ error: 'role query param required' });

    const params: any[] = [kindergartenId, role];
    let userFilter = '';
    if (userId) {
      userFilter = `AND (
        target_user_id IS NULL
        OR target_user_id = ''
        OR CAST(target_user_id AS TEXT) = CAST(? AS TEXT)
      )`;
      params.push(userId);
    }
    params.push(limit);

    const notifications = await all<any>(
      `SELECT
         id,
         kindergarten_id,
         target_role,
         target_user_id,
         source_role,
         title,
         message,
         type,
         entity_type,
         entity_id,
         COALESCE(is_read, 0) as is_read,
         created_at
       FROM role_notifications
       WHERE CAST(kindergarten_id AS TEXT) = CAST(? AS TEXT)
         AND UPPER(COALESCE(target_role, '')) = ?
         ${userFilter}
       ORDER BY COALESCE(is_read, 0) ASC, created_at DESC
       LIMIT ?`,
      params
    );

    res.json(notifications.map((item) => ({
      ...item,
      is_read: item.is_read === true || item.is_read === 1 || item.is_read === '1',
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

notificationsRoutes.post('/notifications/:id/read', async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    await run(
      `UPDATE role_notifications
       SET is_read = 1
       WHERE id = ? AND CAST(kindergarten_id AS TEXT) = CAST(? AS TEXT)`,
      [req.params.id, kindergartenId]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

notificationsRoutes.post('/notifications/read-all', async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const role = normalizeRole(req.body.role || req.query.role);
    const userId = normalizeUserId(req.body.userId || req.query.userId);

    if (!role) return res.status(400).json({ error: 'role required' });

    const params: any[] = [kindergartenId, role];
    let userFilter = '';
    if (userId) {
      userFilter = `AND (
        target_user_id IS NULL
        OR target_user_id = ''
        OR CAST(target_user_id AS TEXT) = CAST(? AS TEXT)
      )`;
      params.push(userId);
    }

    await run(
      `UPDATE role_notifications
       SET is_read = 1
       WHERE CAST(kindergarten_id AS TEXT) = CAST(? AS TEXT)
         AND UPPER(COALESCE(target_role, '')) = ?
         ${userFilter}`,
      params
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
