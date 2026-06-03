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
  addMonthsToIsoDate,
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

export const healthExtraRoutes = Router();

healthExtraRoutes.get("/health/children-annual", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all<any>(`
      SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.status,
        c.medical_notes,
        c.allergies,
        c.group_id,
        g.name as group_name,
        hc.latest_check_date
      FROM children c
      LEFT JOIN groups g ON g.id = c.group_id
      LEFT JOIN (
        SELECT child_id, MAX(date) as latest_check_date
        FROM health_checks
        WHERE kindergarten_id = ?
        GROUP BY child_id
      ) hc ON hc.child_id = c.id
      WHERE c.kindergarten_id = ?
      ORDER BY g.name, c.first_name, c.last_name
    `, [kindergartenId, kindergartenId]);

    res.json(rows.map((row) => {
      const nextCheckDate = addMonthsToIsoDate(row.latest_check_date, 12);
      return {
        ...row,
        latest_check_date: row.latest_check_date || null,
        next_check_date: nextCheckDate,
        is_due: isHealthCheckDue(row.latest_check_date, 12),
        frequency_months: 12,
        frequency_label: '1 yilda 1 marta',
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

healthExtraRoutes.get("/health/staff-semiannual", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all<any>(`
      SELECT
        s.id,
        s.full_name,
        s.position,
        s.phone,
        s.status,
        latest.latest_check_date,
        hc.is_fit as latest_is_fit,
        hc.conclusion as latest_conclusion
      FROM staff s
      LEFT JOIN (
        SELECT staff_id, MAX(date) as latest_check_date
        FROM staff_health_checks
        WHERE kindergarten_id = ?
        GROUP BY staff_id
      ) latest ON latest.staff_id = s.id
      LEFT JOIN staff_health_checks hc
        ON hc.staff_id = s.id
       AND hc.kindergarten_id = s.kindergarten_id
       AND hc.date = latest.latest_check_date
      WHERE s.kindergarten_id = ?
      ORDER BY s.full_name
    `, [kindergartenId, kindergartenId]);

    res.json(rows.map((row) => {
      const nextCheckDate = addMonthsToIsoDate(row.latest_check_date, 6);
      return {
        ...row,
        latest_check_date: row.latest_check_date || null,
        latest_is_fit: row.latest_is_fit == null ? null : Boolean(Number(row.latest_is_fit)),
        latest_conclusion: row.latest_conclusion || null,
        next_check_date: nextCheckDate,
        is_due: isHealthCheckDue(row.latest_check_date, 6),
        frequency_months: 6,
        frequency_label: 'Har 6 oyda',
      };
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

healthExtraRoutes.post("/health/staff-check", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const staffId = String(req.body.staff_id || '').trim();
    if (!staffId) return res.status(400).json({ error: 'Xodim tanlanishi shart' });

    const staff = await get<any>('SELECT id, full_name FROM staff WHERE id = ? AND kindergarten_id = ?', [staffId, kindergartenId]);
    if (!staff) return res.status(404).json({ error: 'Xodim topilmadi' });

    const temperature = req.body.temperature === '' || req.body.temperature == null ? null : Number(req.body.temperature);
    if (temperature != null && !Number.isFinite(temperature)) {
      return res.status(400).json({ error: "Harorat noto'g'ri kiritilgan" });
    }

    const id = crypto.randomUUID();
    const date = normalizeIsoDate(req.body.date);
    const isFit = req.body.is_fit === false || req.body.is_fit === 'false' || req.body.is_fit === 0 ? 0 : 1;
    const conclusion = String(req.body.conclusion || '').trim() || (isFit ? "Sog'lom, ishga yaroqli" : "Qo'shimcha ko'rik kerak");

    await run(`
      INSERT INTO staff_health_checks
        (id, kindergarten_id, staff_id, date, temperature, blood_pressure, conclusion, is_fit, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      kindergartenId,
      staffId,
      date,
      temperature,
      req.body.blood_pressure || null,
      conclusion,
      isFit,
      req.body.notes || null,
    ]);

    await logOperation(kindergartenId, 'CREATE', 'staff_health_check', staff.full_name, `${staff.full_name} uchun 6 oylik tibbiy ko'rik qayd qilindi`, 'HEALTH');
    res.status(201).json({ id, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

