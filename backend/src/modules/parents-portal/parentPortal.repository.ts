import crypto from 'crypto';

import sharedDb from '../shared/database.js';

const db = sharedDb as any;

const run = (sql: string, params: any[] = []) => new Promise<any>((resolve, reject) => {
  db.run(sql, params, function (this: any, err: Error | null) {
    if (err) reject(err);
    else resolve(this);
  });
});

const all = <T = any>(sql: string, params: any[] = []) => new Promise<T[]>((resolve, reject) => {
  db.all(sql, params, (err: Error | null, rows: T[]) => err ? reject(err) : resolve(rows));
});

const get = <T = any>(sql: string, params: any[] = []) => new Promise<T | undefined>((resolve, reject) => {
  db.get(sql, params, (err: Error | null, row: T | undefined) => err ? reject(err) : resolve(row));
});

export class ParentPortalRepository {
  listParents(kindergartenId: string) {
    return all(`
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
  }

  updateParentAccount(id: string, kindergartenId: string, updates: Record<string, any>) {
    const fields: string[] = [];
    const params: any[] = [];

    if (updates.login !== undefined) {
      fields.push('login = ?');
      params.push(updates.login);
    }
    if (updates.password_hash !== undefined) {
      fields.push('password_hash = ?');
      params.push(updates.password_hash);
    }

    if (fields.length === 0) return Promise.resolve({ changes: 0, skipped: true });

    return run(`UPDATE parent_accounts SET ${fields.join(', ')} WHERE id = ? AND kindergarten_id = ?`, [
      ...params,
      id,
      kindergartenId,
    ]);
  }

  getParentAccount(id: string, kindergartenId: string) {
    return get<{ id: string; login: string; password_hash: string }>(
      'SELECT id, login, password_hash FROM parent_accounts WHERE id = ? AND kindergarten_id = ?',
      [id, kindergartenId]
    );
  }

  async deleteParentAccount(id: string, kindergartenId: string) {
    await run('UPDATE children SET parent_account_id = NULL WHERE parent_account_id = ? AND kindergarten_id = ?', [id, kindergartenId]);
    return run('DELETE FROM parent_accounts WHERE id = ? AND kindergarten_id = ?', [id, kindergartenId]);
  }

  getChildInfo(childId: string, kindergartenId: string) {
    return get(`
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
    `, [childId, kindergartenId]);
  }

  getAttendance(childId: string, kindergartenId: string) {
    return all('SELECT * FROM attendance WHERE child_id = ? AND kindergarten_id = ? ORDER BY date DESC LIMIT 30', [childId, kindergartenId]);
  }

  getParentLoginHistory(childId: string, kindergartenId: string, limit: number, offset: number) {
    return all(`
      SELECT ple.*
      FROM parent_login_events ple
      INNER JOIN children c ON c.parent_account_id = ple.parent_account_id
      WHERE c.id = ? AND c.kindergarten_id = ? AND ple.kindergarten_id = ?
      ORDER BY ple.created_at DESC
      LIMIT ? OFFSET ?
    `, [childId, kindergartenId, kindergartenId, limit, offset]);
  }

  countParentLoginHistory(childId: string, kindergartenId: string) {
    return get<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM parent_login_events ple
      INNER JOIN children c ON c.parent_account_id = ple.parent_account_id
      WHERE c.id = ? AND c.kindergarten_id = ? AND ple.kindergarten_id = ?
    `, [childId, kindergartenId, kindergartenId]);
  }

  getHealth(childId: string, kindergartenId: string) {
    return all('SELECT * FROM health_checks WHERE child_id = ? AND kindergarten_id = ? ORDER BY date DESC, created_at DESC LIMIT 20', [childId, kindergartenId]);
  }

  getDocuments(childId: string, kindergartenId: string) {
    return all('SELECT * FROM parent_documents WHERE child_id = ? AND kindergarten_id = ? ORDER BY created_at DESC', [childId, kindergartenId]);
  }

  getPickups(childId: string, kindergartenId: string) {
    return all('SELECT * FROM pickup_people WHERE child_id = ? AND kindergarten_id = ? ORDER BY created_at DESC', [childId, kindergartenId]);
  }

  countPickups(childId: string, kindergartenId: string) {
    return get<{ count: number }>('SELECT COUNT(*) as count FROM pickup_people WHERE child_id = ? AND kindergarten_id = ?', [childId, kindergartenId]);
  }

  getMenu(kindergartenId: string, date: string) {
    return all('SELECT * FROM menus WHERE kindergarten_id = ? AND date = ? ORDER BY meal_type', [kindergartenId, date]);
  }

  updateChildProfile(childId: string, kindergartenId: string, data: { address?: string | null; photo_url?: string | null }) {
    return run('UPDATE children SET address = ?, photo_url = ? WHERE id = ? AND kindergarten_id = ?', [
      data.address || null,
      data.photo_url || null,
      childId,
      kindergartenId,
    ]);
  }

  getChildParentIds(childId: string, kindergartenId: string) {
    return get<{ father_id?: string; mother_id?: string }>(
      'SELECT father_id, mother_id FROM children WHERE id = ? AND kindergarten_id = ?',
      [childId, kindergartenId]
    );
  }

  updateParentProfile(parentId: string, kindergartenId: string, data: any) {
    return run('UPDATE parents SET workplace = ?, phone = ?, passport_no = ? WHERE id = ? AND kindergarten_id = ?', [
      data.workplace || null,
      data.phone || null,
      data.passport_no || null,
      parentId,
      kindergartenId,
    ]);
  }

  getChildById(childId: string, kindergartenId: string) {
    return get<{ id: string }>('SELECT id FROM children WHERE id = ? AND kindergarten_id = ?', [childId, kindergartenId]);
  }

  async createDocument(kindergartenId: string, data: { child_id: string; title: string; type: string; file_url: string }) {
    const id = crypto.randomUUID();
    await run('INSERT INTO parent_documents (id, kindergarten_id, child_id, title, type, file_url) VALUES (?, ?, ?, ?, ?, ?)', [
      id,
      kindergartenId,
      data.child_id,
      data.title,
      data.type,
      data.file_url,
    ]);
    return { id, ...data };
  }

  deleteDocument(id: string, kindergartenId: string) {
    return run('DELETE FROM parent_documents WHERE id = ? AND kindergarten_id = ?', [id, kindergartenId]);
  }

  async createPickup(kindergartenId: string, data: any) {
    const id = crypto.randomUUID();
    await run('INSERT INTO pickup_people (id, kindergarten_id, child_id, full_name, relation, phone, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      id,
      kindergartenId,
      data.child_id,
      data.full_name,
      data.relation,
      data.phone,
      data.photo_url || null,
    ]);
    return { id, ...data };
  }

  deletePickup(id: string, kindergartenId: string) {
    return run('DELETE FROM pickup_people WHERE id = ? AND kindergarten_id = ?', [id, kindergartenId]);
  }
}
