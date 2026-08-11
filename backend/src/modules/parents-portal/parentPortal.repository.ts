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

const PARENT_PROFILE_NEWS_KINDERGARTEN_ID = '__parent_profile_news__';

const ensureParentProfileNewsTable = async () => {
  await run(`CREATE TABLE IF NOT EXISTS kindergarten_website_news (
    id TEXT PRIMARY KEY,
    kindergarten_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    body TEXT,
    image_url TEXT,
    media_type TEXT DEFAULT 'image',
    link_url TEXT,
    status TEXT DEFAULT 'draft',
    published_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`ALTER TABLE kindergarten_website_news ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image'`);
  await run(`ALTER TABLE kindergarten_website_news ADD COLUMN IF NOT EXISTS link_url TEXT`);
  await run('CREATE INDEX IF NOT EXISTS idx_kindergarten_website_news_kindergarten ON kindergarten_website_news(kindergarten_id, created_at DESC)');
};

const ensureParentAdvertisementsTable = async () => {
  await run(`CREATE TABLE IF NOT EXISTS admin_advertisements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    duration_days INTEGER DEFAULT 1,
    content_type TEXT DEFAULT 'text',
    image_url TEXT,
    link_url TEXT,
    text TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`ALTER TABLE admin_advertisements ADD COLUMN IF NOT EXISTS link_url TEXT`);
  await run(`ALTER TABLE admin_advertisements ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0`);
  await run('CREATE INDEX IF NOT EXISTS idx_admin_advertisements_status ON admin_advertisements(status, created_at DESC)');
};

export class ParentPortalRepository {
  async getParentProfileNews() {
    await ensureParentProfileNewsTable();
    return all(`
      SELECT *
      FROM kindergarten_website_news
      WHERE kindergarten_id = ?
        AND status = 'published'
      ORDER BY COALESCE(published_at, CAST(created_at AS TEXT)) DESC
      LIMIT 100
    `, [PARENT_PROFILE_NEWS_KINDERGARTEN_ID]);
  }

  async getActiveAdvertisements() {
    await ensureParentAdvertisementsTable();
    return all(`
      SELECT *
      FROM admin_advertisements
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 100
    `);
  }

  async recordAdvertisementView(id: string) {
    await ensureParentAdvertisementsTable();
    return run(`
      UPDATE admin_advertisements
      SET view_count = COALESCE(view_count, 0) + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'active'
    `, [id]);
  }

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
    const fields: string[] = [];
    const params: any[] = [];
    if (Object.prototype.hasOwnProperty.call(data, 'full_name')) {
      const fullName = typeof data.full_name === 'string' ? data.full_name.trim() : '';
      fields.push('full_name = ?');
      params.push(fullName || null);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'workplace')) {
      fields.push('workplace = ?');
      params.push(data.workplace || null);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'phone')) {
      fields.push('phone = ?');
      params.push(data.phone || null);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'passport_no')) {
      fields.push('passport_no = ?');
      params.push(data.passport_no || null);
    }

    if (fields.length === 0) return Promise.resolve({ changes: 0, skipped: true });

    return run(`UPDATE parents SET ${fields.join(', ')} WHERE id = ? AND kindergarten_id = ?`, [
      ...params,
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
