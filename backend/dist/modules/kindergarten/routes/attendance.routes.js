import { Router } from 'express';
import crypto from 'crypto';
import { resolveKindergartenId } from '../requestContext.js';
import { all, get, run, } from './routeSupport.js';
export const attendanceRoutes = Router();
attendanceRoutes.get("/attendance/today-stats", async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        const today = new Date().toISOString().slice(0, 10);
        const groupIds = String(req.query.groupIds || '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
        const groupFilter = groupIds.length ? ` AND c.group_id IN (${groupIds.map(() => '?').join(',')})` : '';
        const params = [kindergartenId, ...groupIds];
        const totals = await get(`
      SELECT COUNT(*) as total
      FROM children c
      WHERE c.kindergarten_id = ? AND COALESCE(c.status, 'ACTIVE') != 'ARCHIVED'${groupFilter}
    `, params);
        const attendance = await get(`
      SELECT
        SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY', 'LATE') THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN UPPER(a.status) IN ('ABSENT', 'KELMADI') THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN UPPER(a.status) = 'LATE' OR (a.arrival_time IS NOT NULL AND a.arrival_time > '09:00') THEN 1 ELSE 0 END) as late
      FROM attendance a
      JOIN children c ON c.id = a.child_id
      WHERE a.kindergarten_id = ? AND a.date = ?${groupFilter}
    `, [kindergartenId, today, ...groupIds]);
        const menuApproval = await get('SELECT COUNT(*) as approved FROM menus WHERE kindergarten_id = ? AND date = ? AND is_approved = 1', [kindergartenId, today]);
        const total = Number(totals?.total || 0);
        const present = Number(attendance?.present || 0);
        const absent = Number(attendance?.absent || Math.max(total - present, 0));
        res.json({
            total,
            present,
            absent,
            late: Number(attendance?.late || 0),
            approved_recipes: Number(menuApproval?.approved || 0)
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
attendanceRoutes.get("/attendance/:groupId/:date", async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        const rows = await all(`
      SELECT a.* FROM attendance a
      JOIN children c ON a.child_id = c.id
      WHERE c.group_id = ? AND a.date = ? AND a.kindergarten_id = ?
    `, [req.params.groupId, req.params.date, kindergartenId]);
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
attendanceRoutes.post("/attendance", async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        const normalizeStatus = (status) => {
            const value = String(status || '').toLowerCase();
            if (value === 'early' || value === 'late')
                return value.toUpperCase();
            if (value === 'absent')
                return 'ABSENT';
            return String(status || 'PRESENT').toUpperCase();
        };
        const date = req.body?.date || new Date().toISOString().slice(0, 10);
        const attendanceData = req.body?.attendance_data || req.body?.attendanceData;
        const items = attendanceData && !Array.isArray(req.body)
            ? Object.entries(attendanceData).map(([childId, value]) => ({
                child_id: childId,
                date,
                status: value?.status,
                reason: value?.reason,
                arrival_time: value?.arrival_time || value?.arrivalTime,
            }))
            : (Array.isArray(req.body) ? req.body : [req.body]);
        for (const item of items) {
            const childId = item.child_id || item.childId;
            if (!childId)
                continue;
            const itemDate = item.date || date;
            const existing = await get('SELECT id FROM attendance WHERE kindergarten_id = ? AND child_id = ? AND date = ?', [kindergartenId, childId, itemDate]);
            const id = item.id || existing?.id || crypto.randomUUID();
            await run(`
        INSERT OR REPLACE INTO attendance (id, kindergarten_id, child_id, date, status, reason, arrival_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
                id,
                kindergartenId,
                childId,
                itemDate,
                normalizeStatus(item.status),
                item.reason || null,
                item.arrival_time || item.arrivalTime || null,
            ]);
        }
        res.status(201).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
