// @ts-nocheck
import db from '../../shared/database.js';
import crypto from 'crypto';
import { assertLoginAvailable } from '../../shared/loginUniqueness.js';
import {
  decorateMedicalItems,
  ensureMedicalInventoryDefaults,
  ensureTables,
  normalizeMedicineName,
} from '../../kindergarten/routes/routeSupport.js';

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

const normalizeDate = (value) => {
  const date = String(value || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
};

const toCost = (value) => {
  if (value === '' || value == null) return 0;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
};

const toCount = (value) => {
  if (value === '' || value == null) return 0;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? Math.floor(numberValue) : 0;
};

const normalizeWorkHours = (value) => {
  const numberValue = Number(value);
  return [4, 9, 9.5, 10.5, 12, 24].includes(numberValue) ? numberValue : 9.5;
};

const deleteKindergartenCascade = async (kindergartenId) => {
  const tables = [
    'attendance',
    'health_checks',
    'staff_health_checks',
    'medical_inventory_movements',
    'medical_inventory_items',
    'parent_documents',
    'pickup_people',
    'inventory_batches',
    'kitchen_tasks',
    'inventory_transactions',
    'lab_samples',
    'chef_sanitary_checks',
    'operations_log',
    'audits',
    'messages',
    'parent_accounts',
    'parents',
    'staff',
    'groups',
    'kindergarten_settings',
    'dishes',
    'menus',
    'products',
    'role_accounts',
    'children',
  ];

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    for (const table of tables) {
      await client.query(`DELETE FROM ${table} WHERE kindergarten_id = $1`, [kindergartenId]);
    }
    const result = await client.query('DELETE FROM kindergartens WHERE id = $1', [kindergartenId]);
    await client.query('COMMIT');
    return result.rowCount || 0;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const slugifyLogin = (value) => {
  const normalized = String(value || 'mtt')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['`]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return `mtt_${normalized || 'bogcha'}`.slice(0, 48);
};
const generateUniqueUsername = async (name) => {
  const base = slugifyLogin(name);
  for (let index = 0; index < 1000; index += 1) {
    const candidate = index === 0 ? base : `${base}_${index + 1}`;
    const existing = await get(
      'SELECT id FROM kindergartens WHERE lower(trim(username)) = lower(trim(?))',
      [candidate]
    );
    if (!existing) return candidate;
  }
  throw new Error('Avtomatik login yaratib boʼlmadi. Iltimos qayta urinib koʼring.');
};

const generateKindergartenCredentials = async (name) => {
  const row = await get(`
    SELECT MAX(CAST(SUBSTR(system_id, 5) AS INTEGER)) as maxNumber
    FROM kindergartens
    WHERE system_id LIKE 'MTT-%'
  `);
  let nextNumber = Number(row?.maxNumber || 0) + 1;
  const username = await generateUniqueUsername(name);

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const numericId = String(nextNumber).padStart(6, '0');
    const systemId = `MTT-${numericId}`;
    const password = `MTT-${numericId}`;
    const existing = await get(
      `SELECT id FROM kindergartens
       WHERE system_id = ?
          OR lower(trim(username)) = lower(trim(?))`,
      [systemId, username]
    );

    if (!existing) {
      return { systemId, username, password };
    }
    nextNumber += 1;
  }

  throw new Error('Avtomatik bogʼcha ID yaratib boʼlmadi. Iltimos qayta urinib koʼring.');
};

const KindergartenController = {
  getAll: (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    db.all(`
      SELECT
        k.*,
        COALESCE(child_counts.children_count, 0) as childrenCount,
        COALESCE(child_counts.children_count, 0) as actualChildrenCount,
        COALESCE(staff_counts.staff_count, 0) as staffCount,
        COALESCE(attendance_counts.attended_before_9, 0) as attendedBefore9,
        COALESCE(attendance_counts.attended_after_9, 0) as attendedAfter9,
        COALESCE(attendance_counts.absent_count, 0) as absent,
        CASE
          WHEN COALESCE(child_counts.children_count, 0) > 0
          THEN ROUND((COALESCE(attendance_counts.present_count, 0) * 100.0) / COALESCE(child_counts.children_count, 0))
          ELSE 0
        END as attendancePercentage
      FROM kindergartens k
      LEFT JOIN (
        SELECT kindergarten_id, COUNT(*) as children_count
        FROM children
        WHERE COALESCE(status, 'ACTIVE') != 'ARCHIVED'
        GROUP BY kindergarten_id
      ) child_counts ON CAST(child_counts.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      LEFT JOIN (
        SELECT kindergarten_id, COUNT(*) as staff_count
        FROM staff
        WHERE COALESCE(status, 'ACTIVE') != 'ARCHIVED'
        GROUP BY kindergarten_id
      ) staff_counts ON CAST(staff_counts.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      LEFT JOIN (
        SELECT
          a.kindergarten_id,
          SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY', 'LATE') THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN UPPER(a.status) IN ('ABSENT', 'KELMADI') THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY') AND (a.arrival_time IS NULL OR a.arrival_time <= '09:00') THEN 1 ELSE 0 END) as attended_before_9,
          SUM(CASE WHEN UPPER(a.status) = 'LATE' OR (a.arrival_time IS NOT NULL AND a.arrival_time > '09:00') THEN 1 ELSE 0 END) as attended_after_9
        FROM attendance a
        WHERE a.date = ?
        GROUP BY a.kindergarten_id
      ) attendance_counts ON CAST(attendance_counts.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      ORDER BY k.created_at DESC
    `, [today], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  },

  getDailyDistrictExpenses: async (req, res) => {
    const date = normalizeDate(req.query.date);
    try {
      const result = await db.pool.query(
        `SELECT id, date, district, cost_per_child, note, created_at, updated_at
         FROM daily_district_expenses
         WHERE date = $1
         ORDER BY district`,
        [date]
      );
      res.json({
        date,
        entries: result.rows.map((row) => ({
          id: row.id,
          date: row.date,
          district: row.district,
          costPerChild: Number(row.cost_per_child || 0),
          note: row.note || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  saveDailyDistrictExpenses: async (req, res) => {
    const date = normalizeDate(req.body.date);
    const entries = Array.isArray(req.body.entries) ? req.body.entries : [];

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const saved = [];
      for (const entry of entries) {
        const district = String(entry?.district || '').trim();
        if (!district) continue;
        const costPerChild = toCost(entry?.costPerChild ?? entry?.cost_per_child);
        const note = String(entry?.note || '').trim() || null;
        const id = entry?.id || crypto.randomUUID();
        const result = await client.query(
          `INSERT INTO daily_district_expenses (id, date, district, cost_per_child, note, updated_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
           ON CONFLICT (date, district)
           DO UPDATE SET cost_per_child = EXCLUDED.cost_per_child,
                         note = EXCLUDED.note,
                         updated_at = CURRENT_TIMESTAMP
           RETURNING id, date, district, cost_per_child, note, created_at, updated_at`,
          [id, date, district, costPerChild, note]
        );
        saved.push(result.rows[0]);
      }
      await client.query('COMMIT');
      res.json({
        success: true,
        date,
        entries: saved.map((row) => ({
          id: row.id,
          date: row.date,
          district: row.district,
          costPerChild: Number(row.cost_per_child || 0),
          note: row.note || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  },

  getMedicalStockAlerts: async (req, res) => {
    try {
      await ensureTables();

      const kindergartens = await new Promise((resolve, reject) => {
        db.all(
          `SELECT id, name, district, address, phone, currentChildren
           FROM kindergartens
           ORDER BY district, name`,
          [],
          (err, rows) => err ? reject(err) : resolve(rows || [])
        );
      });

      await Promise.all(
        kindergartens.map((kindergarten) => ensureMedicalInventoryDefaults(String(kindergarten.id)))
      );

      const today = new Date().toISOString().slice(0, 10);
      const rows = await new Promise((resolve, reject) => {
        db.all(
          `
            SELECT
              i.*,
              k.name as kindergarten_name,
              k.district,
              k.address,
              k.phone,
              COALESCE(child_counts.children_count, k.currentChildren, 0) as child_count_basis,
              COALESCE(SUM(CASE WHEN m.type = 'IN' THEN m.quantity WHEN m.type = 'OUT' THEN -m.quantity ELSE 0 END), 0) as current_quantity,
              COUNT(m.id) as movement_count,
              MIN(CASE WHEN m.type = 'IN' AND m.expiry_date IS NOT NULL AND m.expiry_date >= ? THEN m.expiry_date END) as nearest_expiry_date,
              MIN(CASE WHEN m.type = 'IN' AND m.expiry_date IS NOT NULL THEN m.expiry_date END) as first_expiry_date,
              MIN(CASE WHEN m.type = 'IN' AND m.expiry_date IS NOT NULL AND m.expiry_date < ? THEN m.expiry_date END) as oldest_expired_date,
              SUM(CASE WHEN m.type = 'IN' AND m.expiry_date IS NOT NULL AND m.expiry_date < ? THEN 1 ELSE 0 END) as expired_batch_count
            FROM medical_inventory_items i
            INNER JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(i.kindergarten_id AS TEXT)
            LEFT JOIN (
              SELECT kindergarten_id, COUNT(*) as children_count
              FROM children
              WHERE COALESCE(status, 'ACTIVE') != 'ARCHIVED'
              GROUP BY kindergarten_id
            ) child_counts ON CAST(child_counts.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
            LEFT JOIN medical_inventory_movements m
              ON m.item_id = i.id
             AND CAST(m.kindergarten_id AS TEXT) = CAST(i.kindergarten_id AS TEXT)
            GROUP BY
              i.id, i.kindergarten_id, i.name, i.form, i.unit, i.required_per_100, i.required_label,
              i.is_default, i.created_at, i.updated_at, k.name, k.district, k.address, k.phone,
              k.currentChildren, child_counts.children_count
            ORDER BY k.district, k.name, i.is_default DESC, i.name
          `,
          [today, today, today],
          (err, resultRows) => err ? reject(err) : resolve(resultRows || [])
        );
      });

      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 30);
      const warningIso = warningDate.toISOString().slice(0, 10);

      const statusPriority = {
        EXPIRED: 5,
        EMPTY: 4,
        LOW: 3,
        EXPIRING: 2,
        NOT_ENTERED: 1,
        OK: 0,
      };

      const rawItems = rows.map((row) => {
        const decorated = decorateMedicalItems([row], Number(row.child_count_basis || 0))[0];
        const expiredBatchCount = Number(row.expired_batch_count || 0);
        let status = decorated.status;

        if (Number(decorated.movement_count || 0) === 0) status = 'NOT_ENTERED';
        else if (expiredBatchCount > 0) status = 'EXPIRED';
        else if (Number(decorated.current_quantity || 0) <= 0) status = 'EMPTY';
        else if (decorated.nearest_expiry_date && decorated.nearest_expiry_date <= warningIso) status = 'EXPIRING';
        else if (Number(decorated.required_quantity || 0) > 0 && Number(decorated.current_quantity || 0) < Number(decorated.required_quantity || 0)) status = 'LOW';

        return {
          ...decorated,
          status,
          kindergarten_id: row.kindergarten_id,
          kindergarten_name: row.kindergarten_name,
          district: row.district,
          address: row.address,
          phone: row.phone,
          oldest_expired_date: row.oldest_expired_date || null,
          expired_batch_count: expiredBatchCount,
        };
      });

      const dedupedItemsByKindergarten = new Map();
      rawItems.forEach((item) => {
        const key = `${item.kindergarten_id}:${normalizeMedicineName(item.name)}`;
        const existing = dedupedItemsByKindergarten.get(key);
        if (!existing) {
          dedupedItemsByKindergarten.set(key, item);
          return;
        }

        const currentPriority = statusPriority[item.status] ?? 0;
        const existingPriority = statusPriority[existing.status] ?? 0;
        const shouldReplace = currentPriority > existingPriority
          || (currentPriority === existingPriority && Number(item.movement_count || 0) > Number(existing.movement_count || 0));

        if (shouldReplace) dedupedItemsByKindergarten.set(key, item);
      });

      const items = Array.from(dedupedItemsByKindergarten.values());

      const issueStatuses = new Set(['NOT_ENTERED', 'LOW', 'EMPTY', 'EXPIRED', 'EXPIRING']);
      const issues = items.filter((item) => issueStatuses.has(item.status));
      const summary = {
        kindergartens: kindergartens.length,
        total_items: items.length,
        issues: issues.length,
        expired: issues.filter((item) => item.status === 'EXPIRED').length,
        empty: issues.filter((item) => item.status === 'EMPTY').length,
        low: issues.filter((item) => item.status === 'LOW').length,
        expiring: issues.filter((item) => item.status === 'EXPIRING').length,
        not_entered: issues.filter((item) => item.status === 'NOT_ENTERED').length,
      };

      res.json({
        generated_at: new Date().toISOString(),
        summary,
        items,
        issues,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById: (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    db.get(`
      SELECT
        k.*,
        COALESCE(child_counts.children_count, 0) as childrenCount,
        COALESCE(child_counts.children_count, 0) as actualChildrenCount,
        COALESCE(staff_counts.staff_count, 0) as staffCount,
        COALESCE(attendance_counts.attended_before_9, 0) as attendedBefore9,
        COALESCE(attendance_counts.attended_after_9, 0) as attendedAfter9,
        COALESCE(attendance_counts.absent_count, 0) as absent,
        CASE
          WHEN COALESCE(child_counts.children_count, 0) > 0
          THEN ROUND((COALESCE(attendance_counts.present_count, 0) * 100.0) / COALESCE(child_counts.children_count, 0))
          ELSE 0
        END as attendancePercentage
      FROM kindergartens k
      LEFT JOIN (
        SELECT kindergarten_id, COUNT(*) as children_count
        FROM children
        WHERE COALESCE(status, 'ACTIVE') != 'ARCHIVED'
        GROUP BY kindergarten_id
      ) child_counts ON CAST(child_counts.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      LEFT JOIN (
        SELECT kindergarten_id, COUNT(*) as staff_count
        FROM staff
        WHERE COALESCE(status, 'ACTIVE') != 'ARCHIVED'
        GROUP BY kindergarten_id
      ) staff_counts ON CAST(staff_counts.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      LEFT JOIN (
        SELECT
          a.kindergarten_id,
          SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY', 'LATE') THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN UPPER(a.status) IN ('ABSENT', 'KELMADI') THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY') AND (a.arrival_time IS NULL OR a.arrival_time <= '09:00') THEN 1 ELSE 0 END) as attended_before_9,
          SUM(CASE WHEN UPPER(a.status) = 'LATE' OR (a.arrival_time IS NOT NULL AND a.arrival_time > '09:00') THEN 1 ELSE 0 END) as attended_after_9
        FROM attendance a
        WHERE a.date = ?
        GROUP BY a.kindergarten_id
      ) attendance_counts ON CAST(attendance_counts.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      WHERE k.id = ?
    `, [today, req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: 'Kindergarten not found' });
      }
      res.json(row);
    });
  },

  getMenus: (req, res) => {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const archive = String(req.query.archive || '').toLowerCase() === 'true';
    const today = new Date().toISOString().slice(0, 10);
    db.all(`
      SELECT
        m.*,
        k.name as kindergartenName,
        k.district as district,
        k.type as kindergartenType
      FROM menus m
      LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(m.kindergarten_id AS TEXT)
      WHERE ${archive ? 'm.date <> ?' : 'm.date = ?'}
      ORDER BY ${archive ? 'm.date DESC,' : ''} k.district, k.name, m.meal_type, m.age_group, m.diet_type
    `, [archive ? today : date], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  },

  getDishes: (req, res) => {
    db.all(`
      SELECT
        d.*,
        k.name as kindergartenName,
        k.district as district
      FROM dishes d
      LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(d.kindergarten_id AS TEXT)
      ORDER BY d.name
    `, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  },

  createDish: (req, res) => {
    const id = crypto.randomUUID();
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Taom nomi majburiy' });
    }

    db.run(`
      INSERT INTO dishes (
        id, kindergarten_id, name, image, image_2, kcal, iron, carbs, vitamins,
        category, cook_time, cook_temperature, output_1_3, output_3_7,
        kcal_1_3, kcal_3_7, ingredients, technology, quality_requirements
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      req.body.kindergarten_id || null,
      name,
      req.body.image || null,
      req.body.image_2 || null,
      Number(req.body.kcal || 0),
      Number(req.body.iron || 0),
      Number(req.body.carbs || 0),
      req.body.vitamins || null,
      req.body.category || null,
      req.body.cook_time || null,
      req.body.cook_temperature || null,
      req.body.output_1_3 || null,
      req.body.output_3_7 || null,
      req.body.kcal_1_3 || null,
      req.body.kcal_3_7 || null,
      typeof req.body.ingredients === 'string' ? req.body.ingredients : JSON.stringify(req.body.ingredients || []),
      req.body.technology || null,
      req.body.quality_requirements || null,
    ], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id, ...req.body, name });
    });
  },

  updateDish: (req, res) => {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Taom nomi majburiy' });
    }

    db.run(`
      UPDATE dishes
      SET kindergarten_id = ?,
          name = ?,
          image = ?,
          image_2 = ?,
          kcal = ?,
          iron = ?,
          carbs = ?,
          vitamins = ?,
          category = ?,
          cook_time = ?,
          cook_temperature = ?,
          output_1_3 = ?,
          output_3_7 = ?,
          kcal_1_3 = ?,
          kcal_3_7 = ?,
          ingredients = ?,
          technology = ?,
          quality_requirements = ?
      WHERE id = ?
    `, [
      req.body.kindergarten_id || null,
      name,
      req.body.image || null,
      req.body.image_2 || null,
      Number(req.body.kcal || 0),
      Number(req.body.iron || 0),
      Number(req.body.carbs || 0),
      req.body.vitamins || null,
      req.body.category || null,
      req.body.cook_time || null,
      req.body.cook_temperature || null,
      req.body.output_1_3 || null,
      req.body.output_3_7 || null,
      req.body.kcal_1_3 || null,
      req.body.kcal_3_7 || null,
      typeof req.body.ingredients === 'string' ? req.body.ingredients : JSON.stringify(req.body.ingredients || []),
      req.body.technology || null,
      req.body.quality_requirements || null,
      req.params.id,
    ], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!this.changes) {
        return res.status(404).json({ error: 'Taom topilmadi' });
      }
      res.json({ id: req.params.id, ...req.body, name });
    });
  },

  deleteDish: (req, res) => {
    db.run('DELETE FROM dishes WHERE id = ?', [req.params.id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!this.changes) {
        return res.status(404).json({ error: 'Taom topilmadi' });
      }
      res.json({ success: true });
    });
  },

  createTenDayMenus: (req, res) => {
    const { kindergartenId, targetType = 'ALL', days } = req.body;

    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: 'days are required' });
    }

    const normalizedType = String(targetType || 'ALL').toUpperCase();
    const typeWhere = kindergartenId ? 'WHERE id = ?' : normalizedType === 'ALL' ? '' : 'WHERE UPPER(type) = ?';
    const typeParams = kindergartenId ? [kindergartenId] : normalizedType === 'ALL' ? [] : [normalizedType];

    db.all(`SELECT id FROM kindergartens ${typeWhere}`, typeParams, (kindergartenErr, kindergartenRows = []) => {
      if (kindergartenErr) {
        return res.status(500).json({ error: kindergartenErr.message });
      }
      if (kindergartenRows.length === 0) {
        return res.status(400).json({ error: 'No kindergartens found for selected type' });
      }

      const targetIds = kindergartenRows.map((row) => row.id);
      const menuRows = [];
      targetIds.forEach((kindergartenId) => {
        days.forEach((day) => {
          Object.entries(day.meals || {}).forEach(([mealType, meal]) => {
            const mealData = typeof meal === 'string' ? { meal_name: meal } : (meal || {});
            if (!mealData.meal_name || !String(mealData.meal_name).trim()) return;
            menuRows.push({
              id: crypto.randomUUID(),
              kindergartenId,
              date: day.date,
              mealName: String(mealData.meal_name).trim(),
              mealType,
              ageGroup: mealData.age_group || 'ALL',
              dietType: mealData.diet_type || 'REGULAR',
              iron: Number(mealData.iron || 0),
              carbohydrates: Number(mealData.carbohydrates || mealData.carbs || 0),
              vitamins: mealData.vitamins || null,
              composition: mealData.composition || null,
              products: mealData.products || null,
              protein: Number(mealData.protein || 0),
              fat: Number(mealData.fat || 0),
              calories: Number(mealData.calories || 0),
              imageUrl: mealData.image_url || null,
            });
          });
        });
      });

      if (menuRows.length === 0) {
        return res.status(400).json({ error: 'At least one meal name is required' });
      }

      const dates = [...new Set(days.map((day) => day.date).filter(Boolean))];
      const datePlaceholders = dates.map(() => '?').join(',');
      const targetPlaceholders = targetIds.map(() => '?').join(',');

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.all(
          `SELECT id FROM menus WHERE kindergarten_id IN (${targetPlaceholders}) AND date IN (${datePlaceholders})`,
        [...targetIds, ...dates],
        (selectErr, existingRows = []) => {
          if (selectErr) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: selectErr.message });
          }

          const existingIds = existingRows.map((row) => row.id);
          const deleteMenus = () => {
            db.run(
              `DELETE FROM menus WHERE kindergarten_id IN (${targetPlaceholders}) AND date IN (${datePlaceholders})`,
              [...targetIds, ...dates],
              (deleteErr) => {
                if (deleteErr) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: deleteErr.message });
                }

                const menuStmt = db.prepare(`
                  INSERT INTO menus (id, kindergarten_id, date, meal_name, meal_type, age_group, diet_type, iron, carbohydrates, vitamins, composition, products, protein, fat, calories, image_url, is_approved)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                const taskStmt = db.prepare('INSERT INTO kitchen_tasks (id, kindergarten_id, menu_id, status) VALUES (?, ?, ?, ?)');

                for (const row of menuRows) {
                  menuStmt.run([
                    row.id,
                    row.kindergartenId,
                    row.date,
                    row.mealName,
                    row.mealType,
                    row.ageGroup,
                    row.dietType,
                    row.iron,
                    row.carbohydrates,
                    row.vitamins,
                    row.composition,
                    row.products,
                    row.protein,
                    row.fat,
                    row.calories,
                    row.imageUrl,
                    0,
                  ]);
                  taskStmt.run([crypto.randomUUID(), row.kindergartenId, row.id, 'PENDING']);
                }

                menuStmt.finalize((menuErr) => {
                  if (menuErr) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: menuErr.message });
                  }

                  taskStmt.finalize((taskErr) => {
                    if (taskErr) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ error: taskErr.message });
                    }

                    db.run('COMMIT', (commitErr) => {
                      if (commitErr) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: commitErr.message });
                      }
                      res.status(201).json({ success: true, inserted: menuRows.length, dates: dates.length, kindergartens: targetIds.length });
                    });
                  });
                });
              }
            );
          };

          if (existingIds.length === 0) {
            deleteMenus();
            return;
          }

          const taskPlaceholders = existingIds.map(() => '?').join(',');
          db.run(`DELETE FROM kitchen_tasks WHERE menu_id IN (${taskPlaceholders})`, existingIds, (taskDeleteErr) => {
            if (taskDeleteErr) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: taskDeleteErr.message });
            }
            deleteMenus();
          });
        }
      );
    });
    });
  },

  create: async (req, res) => {
    const data = { ...req.body };
    let credentials;

    try {
      credentials = await generateKindergartenCredentials(data.name);
      data.system_id = credentials.systemId;
      data.username = await assertLoginAvailable(db, credentials.username);
      data.password = credentials.password;
    } catch (error) {
      return res.status(409).json({ error: error.message });
    }
    
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      const sql = `INSERT INTO kindergartens (
        system_id, name, type, workHours, region, district, licenseFile, brokerageDocumentFile, commissionOrder, commissionApprovedDate, commissionValidUntil, directorName, directorBirthYear, directorPhoto, phone, address, email,
        position, capacity, currentChildren, groups, age13, age37, educators,
        cooks, techStaff, nurseCount, hasNurse, mealType, sanitation, water, kitchenEq,
        hasKitchen, hasAllergyMenu, hasDietMenu, hasWarehouse, warehouseManager,
        avgConsumption, financeType, budget,
        lat, lng, username, password, status, rating, aiMonitoring, threshold
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const nurseCount = toCount(data.nurseCount);
      const workHours = normalizeWorkHours(data.workHours);
      const params = [
        data.system_id, data.name, data.type, workHours, data.region || 'Qashqadaryo', data.district, data.licenseFile || null,
        data.brokerageDocumentFile || null,
        data.commissionOrder || null, data.commissionApprovedDate || null, data.commissionValidUntil || null,
        data.directorName, data.directorBirthYear || null, data.directorPhoto || null, data.phone, data.address, data.email,
        data.position, data.capacity, data.currentChildren, data.groups, data.age13 ? 1 : 0, data.age37 ? 1 : 0, data.educators,
        data.cooks, data.techStaff, nurseCount, (data.hasNurse || nurseCount > 0) ? 1 : 0, data.mealType, data.sanitation, data.water, data.kitchenEq,
        data.hasKitchen === false ? 0 : 1, data.hasAllergyMenu ? 1 : 0, data.hasDietMenu ? 1 : 0,
        data.hasWarehouse ? 1 : 0, data.warehouseManager, data.avgConsumption, data.financeType, data.budget || 0,
        data.lat, data.lng, data.username, data.password, data.status || 'Active', data.rating || 100, data.aiMonitoring ? 1 : 0, data.threshold || 75
      ];

      db.run(sql, params, function(err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        
        const kindergartenId = this.lastID;

        db.run("COMMIT", (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ id: kindergartenId, ...data });
        });
      });
    });
  },

  update: async (req, res) => {
    const data = { ...req.body };

    try {
      const current = await get('SELECT system_id, username, password FROM kindergartens WHERE id = ?', [req.params.id]);
      if (!current) return res.status(404).json({ message: 'Kindergarten not found' });

      data.system_id = data.system_id || current.system_id;
      data.username = data.username
        ? await assertLoginAvailable(db, data.username, { excludeKindergartenId: req.params.id })
        : current.username;
      data.password = data.password || current.password;
    } catch (error) {
      return res.status(409).json({ error: error.message });
    }

    const sql = `UPDATE kindergartens SET 
      system_id = ?, name = ?, type = ?, workHours = ?, region = ?, district = ?, licenseFile = ?, brokerageDocumentFile = ?, commissionOrder = ?, commissionApprovedDate = ?, commissionValidUntil = ?, directorName = ?, directorBirthYear = ?, directorPhoto = ?, phone = ?, address = ?, email = ?,
      position = ?, capacity = ?, currentChildren = ?, groups = ?, age13 = ?, age37 = ?, educators = ?,
      cooks = ?, techStaff = ?, nurseCount = ?, hasNurse = ?, mealType = ?, sanitation = ?, water = ?, kitchenEq = ?,
      hasKitchen = ?, hasAllergyMenu = ?, hasDietMenu = ?, hasWarehouse = ?, warehouseManager = ?,
      avgConsumption = ?, financeType = ?, budget = ?, lat = ?, lng = ?, username = ?, password = ?,
      status = ?, rating = ?, aiMonitoring = ?, threshold = ?
      WHERE id = ?`;
    
    const nurseCount = toCount(data.nurseCount);
    const workHours = normalizeWorkHours(data.workHours);
    db.run(sql, [
      data.system_id, data.name, data.type, workHours, data.region || 'Qashqadaryo', data.district, data.licenseFile || null,
      data.brokerageDocumentFile || null,
      data.commissionOrder || null, data.commissionApprovedDate || null, data.commissionValidUntil || null,
      data.directorName, data.directorBirthYear || null, data.directorPhoto || null, data.phone, data.address, data.email,
      data.position, data.capacity, data.currentChildren, data.groups, data.age13 ? 1 : 0, data.age37 ? 1 : 0, data.educators,
      data.cooks, data.techStaff, nurseCount, (data.hasNurse || nurseCount > 0) ? 1 : 0, data.mealType, data.sanitation, data.water, data.kitchenEq,
      data.hasKitchen === false ? 0 : 1, data.hasAllergyMenu ? 1 : 0, data.hasDietMenu ? 1 : 0,
      data.hasWarehouse ? 1 : 0, data.warehouseManager, data.avgConsumption, data.financeType, data.budget || 0,
      data.lat, data.lng, data.username, data.password, data.status, data.rating || 100, data.aiMonitoring ? 1 : 0, data.threshold || 75,
      req.params.id
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Updated successfully', id: req.params.id });
    });
  },

  delete: async (req, res) => {
    const kindergartenId = Number(req.params.id);
    if (!Number.isInteger(kindergartenId)) {
      return res.status(400).json({ error: 'Invalid kindergarten id' });
    }

    try {
      const deleted = await deleteKindergartenCascade(kindergartenId);
      if (!deleted) {
        return res.status(404).json({ error: 'Kindergarten not found' });
      }
      res.json({ message: 'Deleted successfully', id: req.params.id });
    } catch (err) {
      console.error('Kindergarten delete error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

export default KindergartenController;
