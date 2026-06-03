import crypto from 'crypto';

import { db } from '../db.js';

export const run = (sql: string, params: any[] = []) => new Promise<any>((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});

export const all = <T = any>(sql: string, params: any[] = []) => new Promise<T[]>((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows as T[]));
});

export const get = <T = any>(sql: string, params: any[] = []) => new Promise<T | undefined>((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row as T | undefined));
});

export const resolveChatUserId = async (kindergartenId: string, userId: string, role?: string) => {
  const normalizedRole = String(role || '').toUpperCase();
  const isKindergartenAccount = String(userId) === String(kindergartenId);
  if (!isKindergartenAccount && !['TEACHER', 'DIRECTOR'].includes(normalizedRole)) return userId;

  const teacher = await get<{ id: string }>(
    `SELECT id FROM role_accounts
     WHERE kindergarten_id = ? AND role = 'TEACHER'
     ORDER BY created_at DESC
     LIMIT 1`,
    [kindergartenId]
  ).catch(() => undefined);

  return teacher?.id || userId;
};

export const ensureTables = (() => {
  let promise: Promise<void> | null = null;
  return () => {
    if (!promise) {
      const statements = [
        `CREATE TABLE IF NOT EXISTS inventory_transactions (
          id TEXT PRIMARY KEY,
          kindergarten_id INTEGER,
          product_id TEXT,
          type TEXT NOT NULL,
          quantity REAL NOT NULL,
          unit TEXT,
          date TEXT,
          reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS lab_samples (
          sample_id TEXT PRIMARY KEY,
          kindergarten_id INTEGER,
          dish_id TEXT,
          dish_name TEXT,
          batch_reference TEXT,
          date TEXT,
          storage_location TEXT,
          storage_duration REAL,
          status TEXT,
          lab_result TEXT,
          risk_level TEXT,
          notes TEXT,
          created_by TEXT,
          timestamp TEXT,
          nutrition TEXT,
          test_results TEXT,
          storage_temp_history TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS medical_inventory_items (
          id TEXT PRIMARY KEY,
          kindergarten_id INTEGER,
          name TEXT NOT NULL,
          form TEXT,
          unit TEXT,
          required_per_100 REAL DEFAULT 0,
          required_label TEXT,
          is_default BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS medical_inventory_movements (
          id TEXT PRIMARY KEY,
          kindergarten_id INTEGER,
          item_id TEXT NOT NULL,
          type TEXT NOT NULL,
          quantity REAL NOT NULL,
          movement_date TEXT NOT NULL,
          expiry_date TEXT,
          batch_number TEXT,
          source TEXT,
          reason TEXT,
          group_id TEXT,
          child_id TEXT,
          usage_time TEXT,
          diagnosis TEXT,
          evidence_photo_url TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `ALTER TABLE medical_inventory_movements ADD COLUMN IF NOT EXISTS group_id TEXT`,
        `ALTER TABLE medical_inventory_movements ADD COLUMN IF NOT EXISTS child_id TEXT`,
        `ALTER TABLE medical_inventory_movements ADD COLUMN IF NOT EXISTS usage_time TEXT`,
        `ALTER TABLE medical_inventory_movements ADD COLUMN IF NOT EXISTS diagnosis TEXT`,
        `ALTER TABLE medical_inventory_movements ADD COLUMN IF NOT EXISTS evidence_photo_url TEXT`,
        `CREATE TABLE IF NOT EXISTS staff_health_checks (
          id TEXT PRIMARY KEY,
          kindergarten_id INTEGER,
          staff_id TEXT NOT NULL,
          date TEXT NOT NULL,
          temperature REAL,
          blood_pressure TEXT,
          conclusion TEXT,
          is_fit BOOLEAN DEFAULT 1,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS chef_sanitary_checks (
          id TEXT PRIMARY KEY,
          kindergarten_id INTEGER,
          chef_id TEXT,
          date TEXT,
          passed BOOLEAN DEFAULT 0,
          answers TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS role_accounts (
          id TEXT PRIMARY KEY,
          kindergarten_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          full_name TEXT,
          login TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(kindergarten_id, role)
        )`,
        `DELETE FROM role_accounts
         WHERE role NOT IN (
           'OPERATOR', 'TEACHER', 'NURSE', 'CHEF', 'STOREKEEPER', 'INSPECTOR'
         )`
      ];

      promise = statements.reduce(
        (chain, sql) => chain.then(() => run(sql).then(() => undefined)),
        Promise.resolve()
      );
    }
    return promise;
  };
})();

export const parseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const FIRST_AID_MEDICINE_DEFAULTS = [
  { name: 'Adrenalin', form: 'Inyeksiya uchun eritma 0,1% - 1,0 ampulada', unit: 'ampula', required_per_100: 5, required_label: '5 ta ampula' },
  { name: 'Dimedrol', form: 'Inyeksiya uchun eritma 1% - 1,0 ampulada', unit: 'ampula', required_per_100: 5, required_label: '5 ta ampula' },
  { name: 'Suprastin', form: 'Inyeksiya uchun eritma 2% - 1,0 ampulada', unit: 'ampula', required_per_100: 3, required_label: '3 ta ampula' },
  { name: 'Prednizolon', form: 'Inyeksiya uchun eritma 30 mg/ml ampulada', unit: 'ampula', required_per_100: 2, required_label: '2 ta ampula' },
  { name: 'Magniya sulfat', form: 'Inyeksiya uchun eritma 25% - 5,0 ampulada', unit: 'ampula', required_per_100: 5, required_label: '5 ta ampula' },
  { name: 'Analgin', form: 'Inyeksiya uchun eritma 25% - 2,0 ampulada', unit: 'ampula', required_per_100: 5, required_label: '5 ta ampula' },
  { name: 'Novokain', form: 'Inyeksiya uchun eritma 0,5% - 5,0 ampulada', unit: 'ampula', required_per_100: 10, required_label: '10 ta ampula' },
  { name: 'Eufillin', form: 'Inyeksiya uchun eritma 2,4% - 10,0 ampulada', unit: 'ampula', required_per_100: 3, required_label: '3 ta ampula' },
  { name: 'Kalsiya glyukonat', form: 'Inyeksiya uchun eritma 10% - 10,0 ampulada', unit: 'ampula', required_per_100: 3, required_label: '3 ta ampula' },
  { name: 'No-shpa', form: 'Inyeksiya uchun eritma 2% - 2,0 ampulada', unit: 'ampula', required_per_100: 5, required_label: '5 ta ampula' },
  { name: 'Ammiak eritmasi', form: 'Suvli eritma 10% - 20,0 flakonda', unit: 'flakon', required_per_100: 2, required_label: '2 ta flakon' },
  { name: 'Yod eritmasi', form: 'Spirtli eritma 5% - 10,0 flakonda', unit: 'flakon', required_per_100: 3, required_label: '3 ta flakon' },
  { name: 'Brilliant koвЂki', form: 'Spirtli eritma 1% - 20,0 flakonda', unit: 'flakon', required_per_100: 2, required_label: '2 ta flakon' },
  { name: 'Valeriana ekstrakti', form: 'Tabletka 20 mg - 10 tadan kontur uyali oвЂramda', unit: 'oвЂram', required_per_100: 2, required_label: '2 ta oвЂram' },
  { name: 'Paratsetamol', form: 'Tabletka 500 mg - 10 tadan kontur uyali oвЂramda', unit: 'oвЂram', required_per_100: 2, required_label: '2 ta oвЂram' },
  { name: 'Tibbiy paxta', form: '200 grammli oвЂramda', unit: 'oвЂram', required_per_100: 2, required_label: '2 ta oвЂram' },
  { name: 'Tibbiy bint', form: 'Tibbiy matoli bint oвЂramda', unit: 'oвЂram', required_per_100: 20, required_label: '20 ta oвЂram' },
  { name: 'Bir marotaba ishlatiladigan shpritslar', form: 'Inyeksiya uchun 2,0-5,0-10,0 ml shpritslar', unit: 'dona', required_per_100: 10, required_label: '10 ta donadan' },
  { name: 'Tibbiy etil spirti', form: 'Eritma 70% - 100 ml (25, 40, 50 ml) flakonda', unit: 'flakon', required_per_100: 4, required_label: '4 ta flakon' },
  { name: 'Zararsizlantiruvchi vositalari', form: 'Gipoxlorid kalsiy yoki boshqa zararsizlantiruvchi vositalar', unit: 'gramm/kun', required_per_100: 100, required_label: '1 bola uchun kuniga 1 gramm yoki yoвЂriqnoma boвЂyicha' },
];

export const normalizeMedicineName = (value: any) => String(value || '')
  .toLowerCase()
  .replace(/\u0432\u0402[\u0098\u0099\u2122]/g, "'")
  .replace(/[\u2018\u2019\u02bb\u02bc`]/g, "'")
  .replace(/[^a-z0-9]+/g, '')
  .trim();

export const toPositiveNumber = (value: any) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
};

export const normalizeIsoDate = (value: any, fallback = new Date().toISOString().slice(0, 10)) => {
  const date = String(value || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : fallback;
};

export const addMonthsToIsoDate = (value: any, months: number) => {
  const date = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setUTCMonth(parsed.getUTCMonth() + months);
  return parsed.toISOString().slice(0, 10);
};

export const isHealthCheckDue = (latestDate: any, months: number) => {
  const nextDate = addMonthsToIsoDate(latestDate, months);
  if (!nextDate) return true;
  return nextDate <= new Date().toISOString().slice(0, 10);
};

export const MEDICAL_ARCHIVE_MONTHS = [1, 3, 6, 12, 24];

export const normalizeArchiveMonths = (value: any) => {
  const months = Number(value || 24);
  return MEDICAL_ARCHIVE_MONTHS.includes(months) ? months : 24;
};

export const getArchiveCutoffDate = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
};

export const getKindergartenChildCount = async (kindergartenId: string) => {
  const children = await get<{ count: any }>('SELECT COUNT(*) as count FROM children WHERE kindergarten_id = ?', [kindergartenId]);
  const kindergarten = await get<any>('SELECT currentChildren FROM kindergartens WHERE id = ?', [kindergartenId]);
  return Number(children?.count || kindergarten?.currentChildren || kindergarten?.currentchildren || 0);
};

export const ensureMedicalInventoryDefaults = async (kindergartenId: string) => {
  await ensureTables();
  const existingItems = await all<{ id: string; name: string }>(
    'SELECT id, name FROM medical_inventory_items WHERE kindergarten_id = ?',
    [kindergartenId]
  );
  for (const item of FIRST_AID_MEDICINE_DEFAULTS) {
    const existing = existingItems.find((row) => normalizeMedicineName(row.name) === normalizeMedicineName(item.name));
    if (!existing) {
      const id = crypto.randomUUID();
      await run(
        `INSERT INTO medical_inventory_items
          (id, kindergarten_id, name, form, unit, required_per_100, required_label, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, kindergartenId, item.name, item.form, item.unit, item.required_per_100, item.required_label, 1]
      );
      existingItems.push({ id, name: item.name });
    }
  }
};

export const getMedicalItemStock = async (kindergartenId: string, itemId: string, excludeMovementId?: string) => {
  const params: any[] = [kindergartenId, itemId];
  let excludeSql = '';
  if (excludeMovementId) {
    params.push(excludeMovementId);
    excludeSql = ' AND id <> ?';
  }
  const row = await get<{ total: any }>(`
    SELECT COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity WHEN type = 'OUT' THEN -quantity ELSE 0 END), 0) as total
    FROM medical_inventory_movements
    WHERE kindergarten_id = ? AND item_id = ?${excludeSql}
  `, params);
  return Number(row?.total || 0);
};

export const decorateMedicalItems = (rows: any[], childCount: number) => {
  const today = new Date().toISOString().slice(0, 10);
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + 30);
  const warningIso = warningDate.toISOString().slice(0, 10);
  const base = Math.max(childCount, 1);

  return rows.map((row) => {
    const currentQuantity = Number(row.current_quantity || 0);
    const movementCount = Number(row.movement_count || 0);
    const requiredPer100 = Number(row.required_per_100 || 0);
    const requiredQuantity = requiredPer100 > 0 ? Math.ceil((requiredPer100 * base) / 100) : 0;
    const nearestExpiryDate = row.nearest_expiry_date || row.first_expiry_date || null;
    let status = 'OK';

    if (movementCount === 0) status = 'NOT_ENTERED';
    else if (currentQuantity <= 0) status = 'EMPTY';
    else if (nearestExpiryDate && nearestExpiryDate < today) status = 'EXPIRED';
    else if (nearestExpiryDate && nearestExpiryDate <= warningIso) status = 'EXPIRING';
    else if (requiredQuantity > 0 && currentQuantity < requiredQuantity) status = 'LOW';

    return {
      ...row,
      current_quantity: currentQuantity,
      movement_count: movementCount,
      required_per_100: requiredPer100,
      required_quantity: requiredQuantity,
      child_count_basis: childCount,
      nearest_expiry_date: nearestExpiryDate,
      status,
    };
  });
};

export const logOperation = async (
  kindergartenId: string,
  operationType: string,
  entityType: string,
  entityName: string,
  description: string,
  category = 'OTHER'
) => {
  await run(`
    INSERT INTO operations_log (id, operation_type, entity_type, entity_name, description, category, kindergarten_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [crypto.randomUUID(), operationType, entityType, entityName, description, category, kindergartenId]);
};

export const resolveMedicalOutDetails = async (kindergartenId: string, body: any) => {
  const groupId = String(body.group_id || '').trim();
  const childId = String(body.child_id || '').trim();
  const usageTime = String(body.usage_time || '').trim();
  const diagnosis = String(body.diagnosis || '').trim();
  const evidencePhotoUrl = String(body.evidence_photo_url || '').trim();

  if (!groupId || !childId || !usageTime || !diagnosis || !evidencePhotoUrl) {
    throw new Error('Chiqim uchun guruh, bola, vaqt, tashxis va foto dalil kiritilishi shart');
  }
  if (!/^\d{2}:\d{2}$/.test(usageTime)) {
    throw new Error("Chiqim vaqti HH:mm formatida bo'lishi kerak");
  }

  const group = await get<any>('SELECT id, name FROM groups WHERE id = ? AND kindergarten_id = ?', [groupId, kindergartenId]);
  if (!group) throw new Error('Guruh topilmadi');

  const child = await get<any>(
    `SELECT id, first_name, last_name, group_id
     FROM children
     WHERE id = ? AND kindergarten_id = ?`,
    [childId, kindergartenId]
  );
  if (!child) throw new Error('Bola topilmadi');
  if (String(child.group_id || '') !== groupId) {
    throw new Error('Tanlangan bola ushbu guruhga tegishli emas');
  }

  return {
    groupId,
    childId,
    usageTime,
    diagnosis,
    evidencePhotoUrl,
    groupName: group.name,
    childName: `${child.first_name || ''} ${child.last_name || ''}`.trim(),
  };
};
