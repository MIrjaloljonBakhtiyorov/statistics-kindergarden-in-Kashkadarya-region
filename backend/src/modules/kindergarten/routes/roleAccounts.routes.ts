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

export const roleAccountsRoutes = Router();

const roleLabels: Record<string, string> = {
  OPERATOR: 'Operator',
  TEACHER: 'Tarbiyachi',
  NURSE: 'Hamshira',
  CHEF: 'Oshpaz',
  STOREKEEPER: 'Omborchi',
  INSPECTOR: "Organoleptik ko'rsatkichlar",
  LAB_CONTROLLER: 'Laboratoriya',
};

const roleDescriptions: Record<string, string> = {
  OPERATOR: "Operator, arxiv va bog'cha web sayti menyulari uchun yagona kirish",
  TEACHER: "Tarbiyachi bo'limi uchun alohida kirish",
  NURSE: "Hamshira bo'limi uchun alohida kirish",
  CHEF: "Oshpaz bo'limi uchun alohida kirish",
  STOREKEEPER: "Omborchi bo'limi uchun alohida kirish",
  INSPECTOR: "Organoleptik ko'rsatkichlar bo'limi uchun alohida kirish",
  LAB_CONTROLLER: "Laboratoriya bo'limi uchun alohida kirish",
};

roleAccountsRoutes.get("/role-accounts", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all<any>(
      `SELECT id, role, full_name, login, created_at, updated_at
       FROM role_accounts
       WHERE kindergarten_id = ?
       ORDER BY CASE role
         WHEN 'OPERATOR' THEN 1
         WHEN 'TEACHER' THEN 2
         WHEN 'NURSE' THEN 3
         WHEN 'CHEF' THEN 4
         WHEN 'STOREKEEPER' THEN 5
         WHEN 'INSPECTOR' THEN 6
         WHEN 'LAB_CONTROLLER' THEN 7
         ELSE 99
       END`,
      [kindergartenId]
    );
    const byRole = new Map(rows.map((row) => [row.role, row]));

    res.json(Object.entries(roleLabels).map(([role, label]) => ({
      id: byRole.get(role)?.id || null,
      role,
      label,
      description: roleDescriptions[role],
      full_name: byRole.get(role)?.full_name || label,
      login: byRole.get(role)?.login || '',
      created_at: byRole.get(role)?.created_at || null,
      updated_at: byRole.get(role)?.updated_at || null,
      hasPassword: Boolean(byRole.get(role)),
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

roleAccountsRoutes.put("/role-accounts/:role", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const role = String(req.params.role || '').trim().toUpperCase();
    if (!roleLabels[role]) return res.status(400).json({ error: "Noto'g'ri rol" });

    const existing = await get<any>(
      'SELECT id FROM role_accounts WHERE kindergarten_id = ? AND role = ?',
      [kindergartenId, role]
    );
    const login = await assertLoginAvailable(db, req.body.login, { excludeRoleAccountId: existing?.id });
    const fullName = String(req.body.full_name || roleLabels[role]).trim();

    if (existing) {
      const updates = ['full_name = ?', 'login = ?', 'updated_at = CURRENT_TIMESTAMP'];
      const params: any[] = [fullName, login];
      if (req.body.password) {
        updates.push('password_hash = ?');
        params.push(await bcrypt.hash(req.body.password, 10));
      }
      params.push(existing.id, kindergartenId);
      await run(`UPDATE role_accounts SET ${updates.join(', ')} WHERE id = ? AND kindergarten_id = ?`, params);
      return res.json({ success: true, id: existing.id });
    }

    if (!req.body.password) {
      return res.status(400).json({ error: 'Yangi rol uchun parol kiritilishi shart' });
    }

    const id = crypto.randomUUID();
    await run(
      `INSERT INTO role_accounts (id, kindergarten_id, role, full_name, login, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, kindergartenId, role, fullName, login, await bcrypt.hash(req.body.password, 10)]
    );
    res.status(201).json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

