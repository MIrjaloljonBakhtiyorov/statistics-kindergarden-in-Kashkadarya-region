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

    const totals = await get<any>(`
      SELECT COUNT(*) as total
      FROM children c
      WHERE c.kindergarten_id = ? AND COALESCE(c.status, 'ACTIVE') != 'ARCHIVED'${groupFilter}
    `, params);

    const attendance = await get<any>(`
      SELECT
        SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY', 'LATE') THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN UPPER(a.status) IN ('ABSENT', 'KELMADI') THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY') AND (a.arrival_time IS NULL OR a.arrival_time <= '09:30') THEN 1 ELSE 0 END) as early,
        SUM(CASE WHEN UPPER(a.status) = 'LATE' OR (a.arrival_time IS NOT NULL AND a.arrival_time > '09:30') THEN 1 ELSE 0 END) as late
      FROM attendance a
      JOIN children c ON c.id = a.child_id
      WHERE a.kindergarten_id = ? AND a.date = ?${groupFilter}
    `, [kindergartenId, today, ...groupIds]);

    const menuApproval = await get<any>(
      'SELECT COUNT(*) as approved FROM menus WHERE kindergarten_id = ? AND date = ? AND is_approved = 1',
      [kindergartenId, today]
    );

    const total = Number(totals?.total || 0);
    const present = Number(attendance?.present || 0);
    const absent = Number(attendance?.absent || Math.max(total - present, 0));

    res.json({
      total,
      present,
      absent,
      early: Number(attendance?.early || Math.max(present - Number(attendance?.late || 0), 0)),
      late: Number(attendance?.late || 0),
      approved_recipes: Number(menuApproval?.approved || 0)
    });
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

attendanceRoutes.post("/attendance", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const normalizeStatus = (status: string) => {
      const value = String(status || '').toLowerCase();
      if (value === 'early' || value === 'late') return value.toUpperCase();
      if (value === 'absent') return 'ABSENT';
      return String(status || 'PRESENT').toUpperCase();
    };

    const date = req.body?.date || new Date().toISOString().slice(0, 10);
    const attendanceData = req.body?.attendance_data || req.body?.attendanceData;
    const items = attendanceData && !Array.isArray(req.body)
      ? Object.entries(attendanceData).map(([childId, value]: [string, any]) => {
          const isObjectValue = value && typeof value === 'object';
          return {
            child_id: childId,
            date,
            status: isObjectValue ? value.status : value,
            reason: isObjectValue ? value.reason : req.body?.reason,
            arrival_time: isObjectValue ? (value.arrival_time || value.arrivalTime) : req.body?.arrival_time,
          };
        })
      : (Array.isArray(req.body) ? req.body : [req.body]);

    for (const item of items) {
      const childId = item.child_id || item.childId;
      if (!childId) continue;
      const itemDate = item.date || date;
      const existing = await get<any>(
        'SELECT id FROM attendance WHERE kindergarten_id = ? AND child_id = ? AND date = ?',
        [kindergartenId, childId, itemDate]
      );
      const status = normalizeStatus(item.status);
      const reason = item.reason || null;
      const arrivalTime = item.arrival_time || item.arrivalTime || null;

      if (existing?.id) {
        await run(`
          UPDATE attendance
          SET status = ?, reason = ?, arrival_time = ?
          WHERE id = ? AND kindergarten_id = ?
        `, [
          status,
          reason,
          arrivalTime,
          existing.id,
          kindergartenId,
        ]);
      } else {
        await run(`
          INSERT INTO attendance (id, kindergarten_id, child_id, date, status, reason, arrival_time)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          item.id || crypto.randomUUID(),
          kindergartenId,
          childId,
          itemDate,
          status,
          reason,
          arrivalTime,
        ]);
      }
    }
    res.status(201).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

