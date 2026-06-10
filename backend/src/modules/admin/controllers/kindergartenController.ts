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

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve({ lastID: this.lastID, changes: this.changes || 0 });
  });
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

const ensureAdminWarehousePurchasesTable = async () => {
  await run(`CREATE TABLE IF NOT EXISTS admin_warehouse_purchases (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    district TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit TEXT DEFAULT 'kg',
    quantity REAL DEFAULT 0,
    price_per_unit REAL DEFAULT 0,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, district, product_name)
  )`);
  await run('CREATE INDEX IF NOT EXISTS idx_admin_warehouse_purchases_date ON admin_warehouse_purchases(date)');
  await run('CREATE INDEX IF NOT EXISTS idx_admin_warehouse_purchases_district ON admin_warehouse_purchases(date, district)');
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

const WORK_HOUR_GROUPS = {
  SHORT_4: { hours: [4], meals: ['BREAKFAST'] },
  DAY_9_105: { hours: [9, 9.5, 10.5], meals: ['BREAKFAST', 'LUNCH', 'TEA', 'DINNER'] },
  LONG_12: { hours: [12], meals: ['BREAKFAST', 'LUNCH', 'TEA', 'DINNER'] },
  FULL_24: { hours: [24], meals: ['BREAKFAST', 'LUNCH', 'TEA', 'DINNER'] },
};

const mealTypesForWorkHours = (value) => {
  const hours = normalizeWorkHours(value);
  const group = Object.values(WORK_HOUR_GROUPS).find((item) => item.hours.includes(hours));
  return group?.meals || WORK_HOUR_GROUPS.DAY_9_105.meals;
};

const toIsoTimestamp = (value, fallback = new Date().toISOString()) => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
};

const ensureAdminAlertEventsTable = async () => {
  await run(`CREATE TABLE IF NOT EXISTS admin_alert_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    title TEXT NOT NULL,
    context TEXT,
    actor TEXT,
    entity_type TEXT,
    entity_id TEXT,
    action_url TEXT,
    details_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(`CREATE INDEX IF NOT EXISTS idx_admin_alert_events_created ON admin_alert_events (created_at DESC)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_admin_alert_events_entity ON admin_alert_events (entity_type, entity_id, event_type)`);
};

const recordAdminAlertEvent = async ({
  eventType,
  category,
  status,
  title,
  context,
  actor = 'Admin',
  entityType,
  entityId,
  actionUrl,
  details = [],
}) => {
  await ensureAdminAlertEventsTable();
  const id = crypto.randomUUID();
  await run(
    `INSERT INTO admin_alert_events (
      id, event_type, category, status, title, context, actor,
      entity_type, entity_id, action_url, details_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      eventType,
      category,
      status,
      title,
      context || null,
      actor,
      entityType || null,
      entityId == null ? null : String(entityId),
      actionUrl || null,
      JSON.stringify(details || []),
    ]
  );
  return id;
};

const parseAlertDetails = (value) => {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeDistrictKey = (value) => String(value || "Noma'lum tuman")
  .trim()
  .toLowerCase()
  .replace(/[\u2018\u2019\u02bb`]/g, "'")
  .replace(/g'uzor/g, 'guzor');

const percent = (part, total) => Number(total || 0) > 0 ? Math.round((Number(part || 0) * 100) / Number(total || 0)) : 0;

const toNumberValue = (value) => {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const addDaysToIsoDate = (value, days) => {
  const date = new Date(`${normalizeDate(value)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const weekdayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

const getWeekdayName = (value) => {
  const date = new Date(`${normalizeDate(value)}T00:00:00.000Z`);
  return weekdayNames[date.getUTCDay()] || "Noma'lum";
};

const getSeasonName = (value) => {
  const month = Number(String(normalizeDate(value)).slice(5, 7));
  if ([12, 1, 2].includes(month)) return 'Qish';
  if ([3, 4, 5].includes(month)) return 'Bahor';
  if ([6, 7, 8].includes(month)) return 'Yoz';
  return 'Kuz';
};

const isPresentStatus = (status) => ['PRESENT', 'KELDI', 'EARLY', 'LATE'].includes(String(status || '').toUpperCase());
const isAbsentStatus = (status) => ['ABSENT', 'KELMADI'].includes(String(status || '').toUpperCase());

const getAgeFromBirthDate = (birthDate, date) => {
  if (!birthDate) return null;
  const birth = new Date(`${String(birthDate).slice(0, 10)}T00:00:00.000Z`);
  const current = new Date(`${normalizeDate(date)}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime())) return null;
  let age = current.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = current.getUTCMonth() < birth.getUTCMonth()
    || (current.getUTCMonth() === birth.getUTCMonth() && current.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return Math.max(age, 0);
};

const getChildAgeGroup = (child, date) => {
  const explicit = String(child?.age_category || child?.group_age_category || child?.ageCategory || '').trim();
  if (explicit) return explicit;
  const age = getAgeFromBirthDate(child?.birth_date || child?.birthDate, date);
  if (age == null) return "Noma'lum yosh";
  if (age <= 2) return '1-2 yosh';
  if (age <= 3) return '3 yosh';
  if (age <= 4) return '4 yosh';
  if (age <= 5) return '5 yosh';
  if (age <= 6) return '6 yosh';
  return '7+ yosh';
};

const pushMetric = (map, key, defaults = {}) => {
  if (!map.has(key)) map.set(key, { name: key, present: 0, absent: 0, late: 0, marked: 0, children: 0, ...defaults });
  return map.get(key);
};

const ensureAdminAIInsightsTable = async () => {
  await run(`CREATE TABLE IF NOT EXISTS admin_ai_insight_cache (
    cache_key TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT,
    analysis_json TEXT NOT NULL,
    snapshot_json TEXT NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
  )`);
  await run(`CREATE INDEX IF NOT EXISTS idx_admin_ai_insight_cache_expires ON admin_ai_insight_cache (expires_at)`);
};

const buildAdminAIInsightSnapshot = async (date) => {
  const periodStart = addDaysToIsoDate(date, -119);
  const currentWeekStart = addDaysToIsoDate(date, -6);
  const previousWeekStart = addDaysToIsoDate(date, -13);
  const previousWeekEnd = addDaysToIsoDate(date, -7);

  const [
    kindergartens,
    childRows,
    attendanceRows,
    expenseRows,
    staffRows,
    menuRows,
    healthRows,
    staffHealthRows,
    parentRows,
    auditRows,
  ] = await Promise.all([
    all(`
      SELECT id, system_id, name, type, district, address, capacity, currentChildren,
             groups, educators, cooks, techStaff, nurseCount, budget, avgConsumption,
             rating, threshold, status
      FROM kindergartens
      ORDER BY district, name
    `),
    all(`
      SELECT
        c.id,
        c.kindergarten_id,
        c.birth_date,
        c.age_category,
        c.address,
        c.group_id,
        g.name as group_name,
        g.age_category as group_age_category,
        g.age_limit,
        k.name as kindergarten_name,
        k.district
      FROM children c
      LEFT JOIN groups g ON CAST(g.id AS TEXT) = CAST(c.group_id AS TEXT)
      LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(c.kindergarten_id AS TEXT)
      WHERE COALESCE(c.status, 'ACTIVE') != 'ARCHIVED'
    `),
    all(`
      SELECT
        a.date,
        a.status,
        a.arrival_time,
        a.reason,
        a.kindergarten_id,
        c.id as child_id,
        c.birth_date,
        c.age_category,
        c.group_id,
        g.name as group_name,
        g.age_category as group_age_category,
        k.name as kindergarten_name,
        k.district
      FROM attendance a
      LEFT JOIN children c ON CAST(c.id AS TEXT) = CAST(a.child_id AS TEXT)
      LEFT JOIN groups g ON CAST(g.id AS TEXT) = CAST(c.group_id AS TEXT)
      LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(a.kindergarten_id AS TEXT)
      WHERE a.date BETWEEN ? AND ?
    `, [periodStart, date]),
    all(`
      SELECT district, cost_per_child
      FROM daily_district_expenses
      WHERE date = ?
    `, [date]),
    all(`
      SELECT
        k.id as kindergarten_id,
        k.name as kindergarten_name,
        k.district,
        COUNT(s.id) as staff_count,
        COALESCE(SUM(CASE WHEN COALESCE(s.status, 'ACTIVE') = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active_staff_count,
        COALESCE(SUM(CASE WHEN LOWER(COALESCE(s.position, '')) LIKE '%tarbiy%' OR LOWER(COALESCE(s.position, '')) LIKE '%teacher%' THEN 1 ELSE 0 END), 0) as educator_actual_count,
        COALESCE(SUM(CASE WHEN LOWER(COALESCE(s.position, '')) LIKE '%hamshir%' OR LOWER(COALESCE(s.position, '')) LIKE '%nurse%' THEN 1 ELSE 0 END), 0) as nurse_actual_count,
        COALESCE(SUM(CASE WHEN LOWER(COALESCE(s.position, '')) LIKE '%oshpaz%' OR LOWER(COALESCE(s.position, '')) LIKE '%chef%' THEN 1 ELSE 0 END), 0) as cook_actual_count,
        COALESCE(SUM(COALESCE(s.salary, 0)), 0) as salary_total
      FROM kindergartens k
      LEFT JOIN staff s ON CAST(s.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      GROUP BY k.id, k.name, k.district
    `),
    all(`
      SELECT
        m.kindergarten_id,
        k.name as kindergarten_name,
        k.district,
        m.date,
        m.meal_type,
        m.age_group,
        m.diet_type,
        m.calories,
        m.protein,
        m.fat,
        m.carbohydrates,
        m.is_approved,
        kt.nurse_quality_status
      FROM menus m
      LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(m.kindergarten_id AS TEXT)
      LEFT JOIN kitchen_tasks kt ON CAST(kt.menu_id AS TEXT) = CAST(m.id AS TEXT)
      WHERE m.date BETWEEN ? AND ?
    `, [currentWeekStart, date]),
    all(`
      SELECT
        hc.kindergarten_id,
        k.name as kindergarten_name,
        k.district,
        hc.date,
        hc.is_sick,
        hc.temperature_status,
        hc.weight_status,
        hc.height_status,
        hc.notes,
        c.group_id,
        c.age_category,
        g.name as group_name,
        g.age_category as group_age_category
      FROM health_checks hc
      LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(hc.kindergarten_id AS TEXT)
      LEFT JOIN children c ON CAST(c.id AS TEXT) = CAST(hc.child_id AS TEXT)
      LEFT JOIN groups g ON CAST(g.id AS TEXT) = CAST(c.group_id AS TEXT)
      WHERE hc.date BETWEEN ? AND ?
    `, [periodStart, date]),
    all(`
      SELECT
        shc.kindergarten_id,
        k.name as kindergarten_name,
        k.district,
        shc.date,
        shc.is_fit,
        shc.conclusion
      FROM staff_health_checks shc
      LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(shc.kindergarten_id AS TEXT)
      WHERE shc.date BETWEEN ? AND ?
    `, [periodStart, date]),
    all(`
      SELECT
        k.id as kindergarten_id,
        k.name as kindergarten_name,
        k.district,
        COUNT(DISTINCT pa.id) as parent_account_count,
        COUNT(DISTINCT m.id) as message_count,
        COUNT(DISTINCT CASE WHEN COALESCE(rn.is_read, 0) = 0 THEN rn.id ELSE NULL END) as unread_notification_count
      FROM kindergartens k
      LEFT JOIN parent_accounts pa ON CAST(pa.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      LEFT JOIN messages m ON CAST(m.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      LEFT JOIN role_notifications rn ON CAST(rn.kindergarten_id AS TEXT) = CAST(k.id AS TEXT)
      GROUP BY k.id, k.name, k.district
    `),
    all(`
      SELECT
        a.kindergarten_id,
        k.name as kindergarten_name,
        k.district,
        a.inspection_type,
        a.overall_result,
        a.severity,
        a.status,
        a.created_at
      FROM audits a
      LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(a.kindergarten_id AS TEXT)
      WHERE a.created_at >= ?
    `, [periodStart]),
  ]);

  const expenseByDistrict = new Map();
  expenseRows.forEach((row) => {
    expenseByDistrict.set(normalizeDistrictKey(row.district), toNumberValue(row.cost_per_child || row.costPerChild));
  });

  const childrenByKindergarten = new Map();
  const childrenByAge = new Map();
  const childrenByDistrict = new Map();
  const mahallaCoverageMap = new Map();
  childRows.forEach((child) => {
    const kindergartenId = String(child.kindergarten_id || child.kindergartenId || '');
    const ageGroup = getChildAgeGroup(child, date);
    const district = child.district || "Noma'lum tuman";
    if (!childrenByKindergarten.has(kindergartenId)) childrenByKindergarten.set(kindergartenId, []);
    childrenByKindergarten.get(kindergartenId).push(child);
    pushMetric(childrenByAge, ageGroup).children += 1;
    pushMetric(childrenByDistrict, district, { district }).children += 1;

    const address = String(child.address || '').trim();
    if (address) {
      const key = `${district} / ${address}`;
      const item = mahallaCoverageMap.get(key) || { name: address, district, enrolledChildren: 0 };
      item.enrolledChildren += 1;
      mahallaCoverageMap.set(key, item);
    }
  });

  const byKindergartenToday = new Map();
  const ageAttendance = new Map();
  const districtAttendance = new Map();
  const weekdayAttendance = new Map();
  const seasonalAttendance = new Map();
  const periodByKindergarten = new Map();

  const markAttendanceMetric = (metric, row) => {
    metric.marked += 1;
    if (isPresentStatus(row.status)) metric.present += 1;
    if (isAbsentStatus(row.status)) metric.absent += 1;
    if (String(row.status || '').toUpperCase() === 'LATE' || (row.arrival_time && row.arrival_time > '09:00')) metric.late += 1;
  };

  attendanceRows.forEach((row) => {
    const kindergartenId = String(row.kindergarten_id || row.kindergartenId || '');
    const district = row.district || "Noma'lum tuman";
    const ageGroup = getChildAgeGroup(row, row.date || date);
    const day = normalizeDate(row.date);

    markAttendanceMetric(pushMetric(weekdayAttendance, getWeekdayName(day)), row);
    markAttendanceMetric(pushMetric(seasonalAttendance, getSeasonName(day)), row);

    if (day === date) {
      markAttendanceMetric(pushMetric(byKindergartenToday, kindergartenId, {
        kindergartenId,
        name: row.kindergartenName || row.kindergarten_name || "Noma'lum MTT",
        district,
      }), row);
      markAttendanceMetric(pushMetric(ageAttendance, ageGroup), row);
      markAttendanceMetric(pushMetric(districtAttendance, district, { district }), row);
    }

    const period = day >= currentWeekStart
      ? 'current'
      : (day >= previousWeekStart && day <= previousWeekEnd ? 'previous' : null);
    if (period) {
      const item = periodByKindergarten.get(kindergartenId) || {
        kindergartenId,
        name: row.kindergartenName || row.kindergarten_name || "Noma'lum MTT",
        district,
        current: { present: 0, absent: 0, marked: 0 },
        previous: { present: 0, absent: 0, marked: 0 },
      };
      item[period].marked += 1;
      if (isPresentStatus(row.status)) item[period].present += 1;
      if (isAbsentStatus(row.status)) item[period].absent += 1;
      periodByKindergarten.set(kindergartenId, item);
    }
  });

  const staffByKindergarten = new Map(staffRows.map((row) => [String(row.kindergarten_id || row.kindergartenId), row]));
  const parentByKindergarten = new Map(parentRows.map((row) => [String(row.kindergarten_id || row.kindergartenId), row]));

  const kindergartenRows = kindergartens.map((kg) => {
    const id = String(kg.id);
    const children = (childrenByKindergarten.get(id) || []).length || toNumberValue(kg.currentChildren);
    const todayMetric = byKindergartenToday.get(id) || { present: 0, absent: 0, late: 0, marked: 0 };
    const inferredAbsent = todayMetric.marked > 0 ? Math.max(children - todayMetric.present, todayMetric.absent) : 0;
    const staff = staffByKindergarten.get(id) || {};
    const requiredEducators = Math.ceil(children / 25);
    const actualEducators = Math.max(toNumberValue(staff.educator_actual_count || staff.educatorActualCount), toNumberValue(kg.educators));
    const educatorShortage = Math.max(requiredEducators - actualEducators, 0);
    const budget = toNumberValue(kg.budget);
    const salaryTotal = toNumberValue(staff.salary_total || staff.salaryTotal);

    return {
      id: kg.id,
      systemId: kg.system_id || kg.systemId,
      name: kg.name || "Noma'lum MTT",
      type: kg.type || "Noma'lum",
      district: kg.district || "Noma'lum tuman",
      address: kg.address || null,
      capacity: toNumberValue(kg.capacity),
      children,
      present: todayMetric.present,
      absent: inferredAbsent,
      late: todayMetric.late,
      marked: todayMetric.marked,
      attendance: percent(todayMetric.present, children),
      dataCompleteness: percent(todayMetric.marked, children),
      freeSeats: Math.max(toNumberValue(kg.capacity) - children, 0),
      budget,
      budgetPerChild: children > 0 ? Math.round(budget / children) : 0,
      salaryTotal,
      salaryShare: budget > 0 ? percent(salaryTotal, budget) : 0,
      rating: toNumberValue(kg.rating),
      threshold: toNumberValue(kg.threshold || 75),
      status: kg.status || 'Active',
      staff: {
        count: toNumberValue(staff.staff_count || staff.staffCount),
        active: toNumberValue(staff.active_staff_count || staff.activeStaffCount),
        actualEducators,
        registeredEducators: toNumberValue(kg.educators),
        requiredEducators,
        educatorShortage,
        childrenPerEducator: actualEducators > 0 ? Math.round((children / actualEducators) * 10) / 10 : 0,
      },
    };
  });

  const districts = Array.from(childrenByDistrict.values()).map((district) => {
    const attendance = districtAttendance.get(district.name) || { present: 0, absent: 0, late: 0, marked: 0 };
    const districtKindergartens = kindergartenRows.filter((kg) => normalizeDistrictKey(kg.district) === normalizeDistrictKey(district.name));
    const capacity = districtKindergartens.reduce((sum, kg) => sum + kg.capacity, 0);
    const children = district.children;
    const costPerChild = expenseByDistrict.get(normalizeDistrictKey(district.name)) || 0;
    const absent = attendance.marked > 0 ? Math.max(children - attendance.present, attendance.absent) : 0;
    return {
      name: district.name,
      kindergartens: districtKindergartens.length,
      children,
      capacity,
      freeSeats: Math.max(capacity - children, 0),
      coverage: percent(children, capacity),
      present: attendance.present,
      late: attendance.late,
      absent,
      marked: attendance.marked,
      attendance: percent(attendance.present, children),
      dataCompleteness: percent(attendance.marked, children),
      costPerChild,
      savedAmount: absent * costPerChild,
      averageRating: districtKindergartens.length
        ? Math.round(districtKindergartens.reduce((sum, kg) => sum + kg.rating, 0) / districtKindergartens.length)
        : 0,
    };
  });

  const lowDistricts = [...districts]
    .filter((district) => district.children > 0 && district.marked > 0)
    .sort((a, b) => a.attendance - b.attendance)
    .slice(0, 8);
  const goodDistricts = [...districts]
    .filter((district) => district.children > 0 && district.marked > 0)
    .sort((a, b) => b.attendance - a.attendance)
    .slice(0, 8);

  const kindergartenRisks = [...kindergartenRows]
    .filter((kg) => kg.children > 0 && kg.marked > 0)
    .sort((a, b) => a.attendance - b.attendance)
    .slice(0, 12);

  const attendanceDeclines = Array.from(periodByKindergarten.values())
    .map((item) => {
      const currentAttendance = percent(item.current.present, item.current.marked);
      const previousAttendance = percent(item.previous.present, item.previous.marked);
      return {
        kindergartenId: item.kindergartenId,
        name: item.name,
        district: item.district,
        currentAttendance,
        previousAttendance,
        decline: previousAttendance - currentAttendance,
        currentMarked: item.current.marked,
        previousMarked: item.previous.marked,
      };
    })
    .filter((item) => item.currentMarked > 0 && item.previousMarked > 0 && item.decline > 0)
    .sort((a, b) => b.decline - a.decline)
    .slice(0, 10);

  const ageGroups = Array.from(childrenByAge.values()).map((age) => {
    const attendance = ageAttendance.get(age.name) || { present: 0, absent: 0, late: 0, marked: 0 };
    const absent = attendance.marked > 0 ? Math.max(age.children - attendance.present, attendance.absent) : 0;
    return {
      name: age.name,
      children: age.children,
      present: attendance.present,
      absent,
      late: attendance.late,
      attendance: percent(attendance.present, age.children),
      dataCompleteness: percent(attendance.marked, age.children),
    };
  }).sort((a, b) => a.attendance - b.attendance);

  const weekdayPatterns = Array.from(weekdayAttendance.values())
    .map((item) => ({ ...item, attendance: percent(item.present, item.marked) }))
    .sort((a, b) => a.attendance - b.attendance);

  const seasonalPatterns = Array.from(seasonalAttendance.values())
    .map((item) => ({ ...item, attendance: percent(item.present, item.marked) }))
    .sort((a, b) => a.attendance - b.attendance);

  const financialOutliers = [...kindergartenRows]
    .filter((kg) => kg.children > 0 && (kg.budgetPerChild > 0 || kg.salaryShare > 0))
    .sort((a, b) => b.budgetPerChild - a.budgetPerChild)
    .slice(0, 10)
    .map((kg) => ({
      name: kg.name,
      district: kg.district,
      budgetPerChild: kg.budgetPerChild,
      salaryShare: kg.salaryShare,
      children: kg.children,
    }));

  const staffShortages = [...kindergartenRows]
    .filter((kg) => kg.staff.educatorShortage > 0 || kg.staff.childrenPerEducator > 25)
    .sort((a, b) => b.staff.educatorShortage - a.staff.educatorShortage)
    .slice(0, 10)
    .map((kg) => ({
      name: kg.name,
      district: kg.district,
      children: kg.children,
      actualEducators: kg.staff.actualEducators,
      requiredEducators: kg.staff.requiredEducators,
      educatorShortage: kg.staff.educatorShortage,
      childrenPerEducator: kg.staff.childrenPerEducator,
    }));

  const menuSummary = {
    periodStart: currentWeekStart,
    periodEnd: date,
    menuItems: menuRows.length,
    approvedItems: menuRows.filter((row) => Number(row.is_approved || row.isApproved || 0) === 1).length,
    nursePending: menuRows.filter((row) => String(row.nurse_quality_status || '').toUpperCase() === 'PENDING').length,
    averageCalories: menuRows.length ? Math.round(menuRows.reduce((sum, row) => sum + toNumberValue(row.calories), 0) / menuRows.length) : 0,
    averageProtein: menuRows.length ? Math.round((menuRows.reduce((sum, row) => sum + toNumberValue(row.protein), 0) / menuRows.length) * 10) / 10 : 0,
    ageGroups: [...new Set(menuRows.map((row) => row.age_group || row.ageGroup).filter(Boolean))],
    dataLimitations: ['Sut mahsulotlari normasi va oziq-ovqat qoldiqlari uchun alohida norma/qoldiq jadvali hali ulanmagan.'],
  };

  const healthSummary = {
    checks: healthRows.length,
    sickChildren: healthRows.filter((row) => Number(row.is_sick || row.isSick || 0) === 1).length,
    temperatureWarnings: healthRows.filter((row) => String(row.temperature_status || row.temperatureStatus || '').toUpperCase() !== 'NORMAL' && String(row.temperature_status || row.temperatureStatus || '').toUpperCase() !== 'NOT_CHECKED').length,
    staffChecks: staffHealthRows.length,
    unfitStaff: staffHealthRows.filter((row) => Number(row.is_fit || row.isFit || 0) === 0).length,
    riskGroups: Object.values(healthRows.reduce((acc, row) => {
      const key = row.group_name || row.groupName || getChildAgeGroup(row, date);
      const item = acc[key] || { name: key, sickChildren: 0, checks: 0 };
      item.checks += 1;
      if (Number(row.is_sick || row.isSick || 0) === 1) item.sickChildren += 1;
      acc[key] = item;
      return acc;
    }, {})).sort((a, b) => b.sickChildren - a.sickChildren).slice(0, 8),
  };

  const parentActivity = parentRows.map((row) => ({
    name: row.kindergartenName || row.kindergarten_name || "Noma'lum MTT",
    district: row.district || "Noma'lum tuman",
    parentAccounts: toNumberValue(row.parent_account_count || row.parentAccountCount),
    messages: toNumberValue(row.message_count || row.messageCount),
    unreadNotifications: toNumberValue(row.unread_notification_count || row.unreadNotificationCount),
  })).sort((a, b) => b.unreadNotifications - a.unreadNotifications).slice(0, 10);

  const topKindergartens = [...kindergartenRows]
    .sort((a, b) => (b.rating + b.attendance) - (a.rating + a.attendance))
    .slice(0, 10)
    .map((kg) => ({ name: kg.name, district: kg.district, rating: kg.rating, attendance: kg.attendance, coverage: percent(kg.children, kg.capacity) }));

  const problematicKindergartens = [...kindergartenRows]
    .sort((a, b) => (a.rating + a.attendance + a.dataCompleteness) - (b.rating + b.attendance + b.dataCompleteness))
    .slice(0, 10)
    .map((kg) => ({
      name: kg.name,
      district: kg.district,
      rating: kg.rating,
      attendance: kg.attendance,
      dataCompleteness: kg.dataCompleteness,
      educatorShortage: kg.staff.educatorShortage,
    }));

  const currentMarked = attendanceRows.filter((row) => normalizeDate(row.date) >= currentWeekStart).length;
  const previousMarked = attendanceRows.filter((row) => normalizeDate(row.date) >= previousWeekStart && normalizeDate(row.date) <= previousWeekEnd).length;
  const currentPresent = attendanceRows.filter((row) => normalizeDate(row.date) >= currentWeekStart && isPresentStatus(row.status)).length;
  const previousPresent = attendanceRows.filter((row) => normalizeDate(row.date) >= previousWeekStart && normalizeDate(row.date) <= previousWeekEnd && isPresentStatus(row.status)).length;
  const currentWeekAttendance = percent(currentPresent, currentMarked);
  const previousWeekAttendance = percent(previousPresent, previousMarked);

  const totals = {
    kindergartens: kindergartenRows.length,
    children: kindergartenRows.reduce((sum, kg) => sum + kg.children, 0),
    capacity: kindergartenRows.reduce((sum, kg) => sum + kg.capacity, 0),
    present: districts.reduce((sum, district) => sum + district.present, 0),
    late: districts.reduce((sum, district) => sum + district.late, 0),
    absent: districts.reduce((sum, district) => sum + district.absent, 0),
    marked: districts.reduce((sum, district) => sum + district.marked, 0),
    savedAmount: districts.reduce((sum, district) => sum + district.savedAmount, 0),
    freeSeats: districts.reduce((sum, district) => sum + district.freeSeats, 0),
    missingExpenseDistricts: districts.filter((district) => district.absent > 0 && district.costPerChild <= 0).length,
    currentWeekAttendance,
    previousWeekAttendance,
    weeklyChange: currentWeekAttendance - previousWeekAttendance,
  };
  totals.attendance = percent(totals.present, totals.children);
  totals.coverage = percent(totals.children, totals.capacity);
  totals.dataCompleteness = percent(totals.marked, totals.children);

  return {
    date,
    periodStart,
    generatedAt: new Date().toISOString(),
    dataAvailability: {
      attendance: attendanceRows.length > 0,
      childRegistry: childRows.length > 0,
      districtExpenses: expenseRows.length > 0,
      staff: staffRows.length > 0,
      menu: menuRows.length > 0,
      health: healthRows.length > 0 || staffHealthRows.length > 0,
      parentActivity: parentRows.length > 0,
      audits: auditRows.length > 0,
      populationByMahalla: false,
      birthStatistics: false,
      utilityCosts: false,
      foodWaste: false,
    },
    stages: {
      stage1Now: ['Davomat tahlili', 'Qamrov tahlili', 'Moliyaviy tahlil', 'Reyting'],
      stage2Next: ['Prognozlash', 'Tavsiyalar berish', 'Mahalla kesimida qamrov xaritasi'],
      stage3Later: ['AI situatsion markaz', 'Ovozli AI yordamchi', "Qaysi hududga bog'cha qurish kerak modeli", "Tug'ilish statistikasi asosida 3-5 yillik prognoz"],
    },
    totals,
    districts,
    lowDistricts,
    goodDistricts,
    kindergartenRisks,
    attendanceDeclines,
    ageGroups,
    weekdayPatterns,
    seasonalPatterns,
    coverage: {
      byDistrict: [...districts].sort((a, b) => a.coverage - b.coverage).slice(0, 10),
      mahallaSignals: Array.from(mahallaCoverageMap.values()).sort((a, b) => b.enrolledChildren - a.enrolledChildren).slice(0, 12),
      note: "Haqiqiy qatnamayotgan bolalar va mahalla qamrovi uchun 3-6 yoshli aholi/tug'ilish statistikasi jadvali kerak.",
    },
    financial: {
      byDistrict: [...districts].sort((a, b) => b.costPerChild - a.costPerChild).slice(0, 10),
      outliers: financialOutliers,
      savedAmount: totals.savedAmount,
      dataLimitations: ['Oziq-ovqat, kommunal va ish haqi xarajatlarini alohida tahlil qilish uchun xarajat kategoriyalari bo‘yicha real jadval kerak.'],
    },
    staff: {
      shortages: staffShortages,
      totalEducatorShortage: staffShortages.reduce((sum, item) => sum + item.educatorShortage, 0),
    },
    nutrition: menuSummary,
    health: healthSummary,
    parentActivity,
    rating: {
      topKindergartens,
      problematicKindergartens,
    },
    forecastSignals: {
      currentWeekAttendance,
      previousWeekAttendance,
      weeklyChange: currentWeekAttendance - previousWeekAttendance,
      confidence: attendanceRows.length >= 100 ? 'medium' : 'low',
      note: 'Aniq 3-5 yillik prognoz uchun tug‘ilish, mahalla aholisi va navbat ma’lumotlari kerak.',
    },
    audit: {
      recentAudits: auditRows.length,
      severeAudits: auditRows.filter((row) => ['HIGH', 'CRITICAL', 'SEVERE'].includes(String(row.severity || '').toUpperCase())).length,
    },
    systemSignals: {
      noAttendanceKindergartens: kindergartenRows.filter((kg) => kg.children > 0 && kg.marked === 0).length,
      lowAttendanceKindergartens: kindergartenRows.filter((kg) => kg.children > 0 && kg.marked > 0 && kg.attendance < kg.threshold).length,
      inactiveKindergartens: kindergartenRows.filter((kg) => String(kg.status || '').toLowerCase() !== 'active' && String(kg.status || '').toLowerCase() !== 'aktiv').length,
      lowDataCompletenessKindergartens: kindergartenRows.filter((kg) => kg.children > 0 && kg.dataCompleteness > 0 && kg.dataCompleteness < 80).length,
    },
  };
};

const parseAIAnalysisText = (text) => {
  const cleaned = String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(cleaned);
};

const buildAIInsightPrompt = (snapshot) => `
Siz Qashqadaryo viloyati maktabgacha ta'lim monitoring tizimi uchun professional AI auditor bo'lib ishlaysiz.
Quyidagi real JSON snapshotni tahlil qiling. Soxta raqam qo'shmang, faqat berilgan datadan xulosa chiqaring.
Ma'lumot yetarli bo'lmagan joylarda aniq "dataGap" yozing va qanday jadval/ma'lumot kerakligini ayting.

Vazifalar:
1. Davomat tahlili: pasaygan bog'chalar, eng yuqori tuman, past yosh guruhlari, haftalik kunlar, mavsumiy o'zgarishlar.
2. Qamrov tahlili: ro'yxatdagi bolalar, sig'im, bo'sh o'rin, past hududlar; haqiqiy qatnamayotgan bolalar uchun population data kerak bo'lsa dataGap yozing.
3. Ota-onalar faolligi: parent_accounts/messages/notifications signallarini tahlil qiling; mobil ilova telemetryasi bo'lmasa dataGap yozing.
4. Moliyaviy tahlil: bir bola uchun xarajat, tejalgan mablag', budjet/staff signallari, ortiqcha xarajat ehtimoli.
5. Kadrlar tahlili: tarbiyachi yetishmovchiligi, pedagog-yuklama, malaka ehtiyoji.
6. Ovqatlanish tahlili: menyu, tasdiqlash, kaloriya/protein, norma/qoldiq datasi yetmasa dataGap.
7. Sog'liq tahlili: kasallanish, risk guruhlar, epidemik xavf signallari.
8. Reyting: TOP va muammoli bog'chalar.
9. Prognozlash: mavjud trend asosida ehtiyotkor signal va ishonchlilik.
10. Rahbar savollariga javob: qaysi tuman past, qaysi bog'cha xarajati yuqori, qayerga yangi bog'cha kerakligi uchun qanday data zarur.

Javobni faqat JSON shaklida qaytaring:
{
  "executiveSummary": "string",
  "systemStatus": "string",
  "currentWeaknesses": ["string"],
  "attendanceAnalysis": {
    "decliningKindergartens": [{"name":"string","district":"string","currentAttendance":0,"previousAttendance":0,"decline":0,"advice":"string"}],
    "highestDistrict": {"name":"string","attendance":0,"advice":"string"},
    "lowAgeGroups": [{"name":"string","attendance":0,"advice":"string"}],
    "weakWeekdays": [{"day":"string","attendance":0,"advice":"string"}],
    "seasonalPatterns": [{"season":"string","attendance":0}]
  },
  "coverageAnalysis": {
    "summary": "string",
    "lowCoverageDistricts": [{"name":"string","coverage":0,"freeSeats":0,"advice":"string"}],
    "dataGap": "string"
  },
  "parentActivityAnalysis": {
    "summary": "string",
    "risks": [{"name":"string","district":"string","parentAccounts":0,"messages":0,"unreadNotifications":0}]
  },
  "financialAnalysis": {
    "summary": "string",
    "outliers": [{"name":"string","district":"string","budgetPerChild":0,"salaryShare":0,"advice":"string"}],
    "dataGap": "string"
  },
  "staffAnalysis": {
    "summary": "string",
    "shortages": [{"name":"string","district":"string","children":0,"actualEducators":0,"requiredEducators":0,"educatorShortage":0,"childrenPerEducator":0}]
  },
  "nutritionAnalysis": {
    "summary": "string",
    "averageCalories": 0,
    "averageProtein": 0,
    "dataGap": "string"
  },
  "healthAnalysis": {
    "summary": "string",
    "riskGroups": [{"name":"string","sickChildren":0,"checks":0}]
  },
  "ratingAnalysis": {
    "topKindergartens": [{"name":"string","district":"string","rating":0,"attendance":0,"coverage":0}],
    "problematicKindergartens": [{"name":"string","district":"string","rating":0,"attendance":0,"dataCompleteness":0,"educatorShortage":0}]
  },
  "forecastAnalysis": {
    "summary": "string",
    "advice": "string"
  },
  "strategicQuestions": ["string"],
  "roadmap": {
    "stage1Now": ["string"],
    "stage2Next": ["string"],
    "stage3Later": ["string"]
  },
  "lowAttendanceDistricts": [{"name":"string","attendance":0,"reason":"string","action":"string"}],
  "goodAttendanceDistricts": [{"name":"string","attendance":0,"incentive":"string"}],
  "kindergartenFocus": [{"name":"string","district":"string","attendance":0,"issue":"string","action":"string"}],
  "childEngagementPlan": ["string"],
  "savingsAnalysis": "string",
  "next24HourActions": ["string"]
}

SNAPSHOT:
${JSON.stringify(snapshot)}
`;

const summarizeAIProviderError = (message) => {
  const text = String(message || '').replace(/\s+/g, ' ').trim();
  if (/quota|billing|rate.?limit|limit/i.test(text)) return 'Tashqi AI provider quota yoki billing limiti sabab javob bermadi.';
  if (/api key|permission|unauthorized|forbidden|invalid/i.test(text)) return 'Tashqi AI provider kalit yoki ruxsat xatosi bilan javob berdi.';
  return text ? text.slice(0, 220) : 'Tashqi AI provider javob bermadi.';
};

const buildLocalAIInsightAnalysis = (snapshot, providerError) => {
  const totals = snapshot?.totals || {};
  const dataAvailability = snapshot?.dataAvailability || {};
  const lowDistricts = snapshot?.lowDistricts || [];
  const goodDistricts = snapshot?.goodDistricts || [];
  const kindergartenRisks = snapshot?.kindergartenRisks || [];
  const attendanceDeclines = snapshot?.attendanceDeclines || [];
  const coverageDistricts = snapshot?.coverage?.byDistrict || [];
  const financial = snapshot?.financial || {};
  const staff = snapshot?.staff || {};
  const nutrition = snapshot?.nutrition || {};
  const health = snapshot?.health || {};
  const rating = snapshot?.rating || {};
  const forecastSignals = snapshot?.forecastSignals || {};
  const warning = summarizeAIProviderError(providerError);

  const currentWeaknesses = [
    totals.dataCompleteness < 95 ? `Davomat to'liqligi ${totals.dataCompleteness || 0}%, ayrim MTTlarda kunlik belgilash to'liq emas.` : null,
    totals.missingExpenseDistricts > 0 ? `${totals.missingExpenseDistricts} ta tumanda bir bola uchun kunlik xarajat kiritilmagan.` : null,
    !dataAvailability.menu ? 'Menyu va ovqatlanish maʼlumotlari yetarli emas.' : null,
    !dataAvailability.audits ? 'Audit natijalari yetarli emas.' : null,
    staff.totalEducatorShortage > 0 ? `Tarbiyachi yetishmovchiligi: ${staff.totalEducatorShortage} nafar.` : null,
  ].filter(Boolean);

  return {
    executiveSummary: `${warning} Shu sababli xulosa mavjud bazadagi davomat, qamrov, kadr, sog'liq va reyting signallari asosida lokal shakllantirildi.`,
    systemStatus: `MTT: ${totals.kindergartens || 0}, bolalar: ${totals.children || 0}, bugungi davomat: ${totals.attendance || 0}%, qamrov: ${totals.coverage || 0}%.`,
    currentWeaknesses,
    attendanceAnalysis: {
      decliningKindergartens: attendanceDeclines.slice(0, 8).map((item) => ({
        name: item.name,
        district: item.district,
        currentAttendance: item.currentAttendance,
        previousAttendance: item.previousAttendance,
        decline: item.decline,
        advice: 'Soʼnggi haftadagi pasayish sababini guruh va ota-ona kesimida tekshiring.',
      })),
      highestDistrict: goodDistricts[0]
        ? { name: goodDistricts[0].name, attendance: goodDistricts[0].attendance, advice: 'Ushbu tajribani past tumanlar bilan solishtiring.' }
        : { name: "Ma'lumot yo'q", attendance: 0, advice: 'Davomat maʼlumotlarini kiriting.' },
      lowAgeGroups: (snapshot?.ageGroups || []).slice(0, 5).map((item) => ({
        name: item.name,
        attendance: item.attendance,
        advice: 'Past yosh guruhlarida kasallik, transport va ota-ona xabardorligi sabablarini tekshiring.',
      })),
      weakWeekdays: (snapshot?.weekdayPatterns || []).slice(0, 5).map((item) => ({
        day: item.name,
        attendance: item.attendance,
        advice: 'Hafta kuni boʼyicha takroriy pasayish boʼlsa, kelish vaqtini va sabablarni ajrating.',
      })),
      seasonalPatterns: (snapshot?.seasonalPatterns || []).slice(0, 4).map((item) => ({
        season: item.name,
        attendance: item.attendance,
      })),
    },
    coverageAnalysis: {
      summary: `Ro'yxatdagi bolalar ${totals.children || 0}, sig'im ${totals.capacity || 0}, bo'sh o'rin ${totals.freeSeats || 0}.`,
      lowCoverageDistricts: coverageDistricts.slice(0, 8).map((item) => ({
        name: item.name,
        coverage: item.coverage,
        freeSeats: item.freeSeats,
        advice: 'Mahalla va 3-6 yoshli aholi kesimidagi qamrov jadvali bilan qayta tekshiring.',
      })),
      dataGap: snapshot?.coverage?.note || "Haqiqiy qamrov uchun mahalla aholisi va tug'ilish statistikasi kerak.",
    },
    parentActivityAnalysis: {
      summary: 'Ota-ona faolligi parent account, xabar va oʼqilmagan bildirishnomalar orqali baholandi.',
      risks: snapshot?.parentActivity || [],
    },
    financialAnalysis: {
      summary: `Tejalgan summa signali: ${totals.savedAmount || 0}. Xarajatlar tumanga kiritilsa tahlil aniqlashadi.`,
      outliers: (financial.outliers || []).map((item) => ({
        ...item,
        advice: 'Budjet, bola soni va ish haqi ulushini hujjatlar bilan solishtiring.',
      })),
      dataGap: (financial.dataLimitations || []).join(' '),
    },
    staffAnalysis: {
      summary: staff.totalEducatorShortage > 0
        ? `Kadrlar boʼyicha asosiy signal: ${staff.totalEducatorShortage} nafar tarbiyachi yetishmovchiligi.`
        : 'Kadrlar boʼyicha keskin yetishmovchilik signali topilmadi.',
      shortages: staff.shortages || [],
    },
    nutritionAnalysis: {
      summary: nutrition.menuItems > 0
        ? `Oxirgi haftada ${nutrition.menuItems} ta menyu yozuvi bor, tasdiqlanganlari ${nutrition.approvedItems || 0}.`
        : 'Menyu yozuvlari yetarli emas, ovqatlanish tahlili cheklangan.',
      averageCalories: nutrition.averageCalories || 0,
      averageProtein: nutrition.averageProtein || 0,
      dataGap: (nutrition.dataLimitations || []).join(' '),
    },
    healthAnalysis: {
      summary: `Sog'liq tekshiruvlari: ${health.checks || 0}, kasallik belgisi bor bolalar: ${health.sickChildren || 0}.`,
      riskGroups: health.riskGroups || [],
    },
    ratingAnalysis: {
      topKindergartens: rating.topKindergartens || [],
      problematicKindergartens: rating.problematicKindergartens || [],
    },
    forecastAnalysis: {
      summary: `Haftalik davomat o'zgarishi: ${forecastSignals.weeklyChange || 0} punkt. Ishonchlilik: ${forecastSignals.confidence || 'low'}.`,
      advice: forecastSignals.note || "Aniq prognoz uchun tug'ilish, navbat va mahalla aholisi maʼlumotlari kerak.",
    },
    strategicQuestions: [
      'Qaysi tumanlarda davomat va qamrov bir vaqtning oʼzida past?',
      'Xarajat kiritilmagan tumanlarda real cost_per_child qachon toʼldiriladi?',
      'Tarbiyachi yuklamasi 25 boladan oshgan MTTlar uchun shtat rejasi bormi?',
    ],
    roadmap: snapshot?.stages || { stage1Now: [], stage2Next: [], stage3Later: [] },
    lowAttendanceDistricts: lowDistricts.map((item) => ({
      name: item.name,
      attendance: item.attendance,
      reason: 'Davomat past yoki belgilash toʼliqligi past.',
      action: 'MTT kesimida sabablarni ajrating va ota-onalar bilan aloqa qiling.',
    })),
    goodAttendanceDistricts: goodDistricts.map((item) => ({
      name: item.name,
      attendance: item.attendance,
      incentive: 'Yaxshi amaliyotni past koʼrsatkichli tumanlarga tarqating.',
    })),
    kindergartenFocus: kindergartenRisks.slice(0, 10).map((item) => ({
      name: item.name,
      district: item.district,
      attendance: item.attendance,
      issue: 'Davomat past MTTlar roʼyxatida.',
      action: 'Guruh, yosh toifasi va sabablar kesimida tekshiruv boshlang.',
    })),
    childEngagementPlan: [
      'Har kuni kelmagan bolalar sababini bir xil formatda belgilang.',
      'Past yosh guruhlarida ota-onalarga individual xabar yuboring.',
      'Qamrovi past hududlar uchun mahalla kesimidagi roʼyxatni ulang.',
    ],
    savingsAnalysis: totals.savedAmount > 0
      ? `Yoʼqlama va xarajat signali boʼyicha taxminiy tejalgan summa ${totals.savedAmount}.`
      : 'Tejalgan mablagʼni hisoblash uchun barcha tumanlarda cost_per_child kiritilishi kerak.',
    next24HourActions: [
      'Quota/billing holatini OpenAI va Gemini kabinetida tekshiring.',
      'Davomat toʼliqligi past MTTlarni bugun qayta tekshiring.',
      'Xarajat kiritilmagan tumanlarga cost_per_child qiymatini kiriting.',
      'Kadr yetishmovchiligi bor MTTlar roʼyxatini direktorlar bilan tasdiqlang.',
    ],
  };
};

const extractOpenAIText = (data) => {
  if (data?.output_text) return data.output_text;
  const textParts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.text) textParts.push(content.text);
    }
  }
  return textParts.join('\n');
};

const callOpenAIInsights = async (snapshot) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  const model = process.env.OPENAI_MODEL || 'gpt-5.2';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: buildAIInsightPrompt(snapshot),
      max_output_tokens: 4000,
      text: {
        format: { type: 'json_object' },
      },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'OpenAI analysis failed');
  return { model, analysis: parseAIAnalysisText(extractOpenAIText(data)) };
};

const callGeminiInsights = async (snapshot) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildAIInsightPrompt(snapshot) }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Gemini analysis failed');
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
  return { model, analysis: parseAIAnalysisText(text) };
};

const buildAqlvoyDishPagePrompt = () => `
Siz Aqlvoy oshpaz retsept kartalari uchun OCR va ma'lumot ajratish yordamchisisiz.
Yuklangan kitob sahifasidagi taom retseptini o'qing va formaga mos JSON qaytaring.
Matnda yo'q qiymatlarni bo'sh string qiling. Taxminiy yoki soxta qiymat qo'shmang.
Masalliqlarni oddiy matn sifatida, har bir masalliqni yangi qatorda qaytaring.

Faqat JSON qaytaring:
{
  "name": "taom nomi",
  "category": "bo'lim yoki kategoriya",
  "cook_time": "tayyorlash vaqti",
  "cook_temperature": "harorat",
  "output_1_3": "1-3 yosh chiqishi",
  "output_3_7": "3-7 yosh chiqishi",
  "kcal_1_3": "1-3 yosh kkal",
  "kcal_3_7": "3-7 yosh kkal",
  "kcal": "umumiy kkal",
  "iron": "temir",
  "carbs": "uglevod",
  "vitamins": "vitaminlar yoki izoh",
  "ingredients": "oddiy matn, har qatorga bitta masalliq",
  "technology": "tayyorlash texnologiyasi",
  "quality_requirements": "sifatiga qo'yiladigan talablar"
}
`;

const normalizeDishAnalysis = (analysis = {}) => ({
  name: String(analysis.name || '').trim(),
  category: String(analysis.category || '').trim(),
  cook_time: String(analysis.cook_time || '').trim(),
  cook_temperature: String(analysis.cook_temperature || '').trim(),
  output_1_3: String(analysis.output_1_3 || '').trim(),
  output_3_7: String(analysis.output_3_7 || '').trim(),
  kcal_1_3: String(analysis.kcal_1_3 || '').trim(),
  kcal_3_7: String(analysis.kcal_3_7 || '').trim(),
  kcal: String(analysis.kcal || '').trim(),
  iron: String(analysis.iron || '').trim(),
  carbs: String(analysis.carbs || '').trim(),
  vitamins: String(analysis.vitamins || '').trim(),
  ingredients: String(analysis.ingredients || '').trim(),
  technology: String(analysis.technology || '').trim(),
  quality_requirements: String(analysis.quality_requirements || '').trim(),
});

const splitDataUrl = (imageDataUrl) => {
  const match = String(imageDataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Rasm data URL formati noto\'g\'ri');
  return { mimeType: match[1], data: match[2] };
};

const callOpenAIDishPageVision = async (imageDataUrl) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  const model = process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || 'gpt-5.2';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: buildAqlvoyDishPagePrompt() },
            { type: 'input_image', image_url: imageDataUrl },
          ],
        },
      ],
      max_output_tokens: 2000,
      text: {
        format: { type: 'json_object' },
      },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'OpenAI retsept tahlili bajarilmadi');
  return { provider: 'openai', model, analysis: normalizeDishAnalysis(parseAIAnalysisText(extractOpenAIText(data))) };
};

const callGeminiDishPageVision = async (imageDataUrl) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const model = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const image = splitDataUrl(imageDataUrl);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: buildAqlvoyDishPagePrompt() },
            { inline_data: { mime_type: image.mimeType, data: image.data } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Gemini retsept tahlili bajarilmadi');
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
  return { provider: 'gemini', model, analysis: normalizeDishAnalysis(parseAIAnalysisText(text)) };
};

const analyzeDishPageWithAI = async (imageDataUrl, requestedProvider) => {
  const provider = resolveAIProvider(requestedProvider);
  if (provider === 'openai') return callOpenAIDishPageVision(imageDataUrl);
  if (provider === 'gemini') return callGeminiDishPageVision(imageDataUrl);
  if (provider === 'ensemble') {
    try {
      return await callOpenAIDishPageVision(imageDataUrl);
    } catch {
      return callGeminiDishPageVision(imageDataUrl);
    }
  }
  throw new Error(getAIProviderSetupMessage(requestedProvider));
};

const getAIProviderConfig = () => {
  const hasOpenAI = Boolean(String(process.env.OPENAI_API_KEY || '').trim());
  const hasGemini = Boolean(String(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim());
  return { hasOpenAI, hasGemini };
};

const resolveAIProvider = (requestedProvider) => {
  const requested = String(requestedProvider || process.env.AI_PROVIDER || 'auto').toLowerCase();
  const { hasOpenAI, hasGemini } = getAIProviderConfig();
  if (requested === 'auto') {
    if (hasOpenAI && hasGemini) return 'ensemble';
    if (hasOpenAI) return 'openai';
    if (hasGemini) return 'gemini';
    return 'unconfigured';
  }
  if (['both', 'dual', 'ensemble', 'openai+gemini', 'gemini+openai'].includes(requested)) {
    return hasOpenAI && hasGemini ? 'ensemble' : 'unconfigured';
  }
  if (requested === 'openai') return hasOpenAI ? 'openai' : 'unconfigured';
  if (requested === 'gemini') return hasGemini ? 'gemini' : 'unconfigured';
  return 'unconfigured';
};

const getAIProviderSetupMessage = (requestedProvider) => {
  const requested = String(requestedProvider || process.env.AI_PROVIDER || 'auto').toLowerCase();
  const { hasOpenAI, hasGemini } = getAIProviderConfig();
  if (requested === 'openai') return 'AI_PROVIDER=openai uchun OPENAI_API_KEY sozlang.';
  if (requested === 'gemini') return 'AI_PROVIDER=gemini uchun GEMINI_API_KEY yoki GOOGLE_API_KEY sozlang.';
  if (['both', 'dual', 'ensemble', 'openai+gemini', 'gemini+openai'].includes(requested)) {
    const missing = [
      !hasOpenAI ? 'OPENAI_API_KEY' : null,
      !hasGemini ? 'GEMINI_API_KEY yoki GOOGLE_API_KEY' : null,
    ].filter(Boolean).join(' va ');
    return `${requested} rejimi uchun ${missing} sozlang.`;
  }
  return 'AI API kalitlari sozlanmagan. AI_PROVIDER=auto uchun kamida bittasi kerak: OPENAI_API_KEY yoki GEMINI_API_KEY.';
};

const uniqueStrings = (items) => [...new Set((items || []).filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];

const mergeArrayObjects = (arrays, limit = 8) => {
  const seen = new Set();
  const merged = [];
  arrays.flat().filter(Boolean).forEach((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });
  return merged.slice(0, limit);
};

const mergeAIAnalyses = (snapshot, analyses) => {
  if (!analyses.length) throw new Error('AI analysis is empty');
  if (analyses.length === 1) return analyses[0];

  const [primary, secondary] = analyses;
  return {
    ...primary,
    executiveSummary: uniqueStrings([primary.executiveSummary, secondary.executiveSummary]).join(' '),
    systemStatus: uniqueStrings([primary.systemStatus, secondary.systemStatus]).join(' '),
    currentWeaknesses: uniqueStrings([
      ...(primary.currentWeaknesses || []),
      ...(secondary.currentWeaknesses || []),
    ]).slice(0, 10),
    attendanceAnalysis: {
      ...(primary.attendanceAnalysis || {}),
      decliningKindergartens: mergeArrayObjects([
        primary.attendanceAnalysis?.decliningKindergartens || [],
        secondary.attendanceAnalysis?.decliningKindergartens || [],
      ], 8),
      lowAgeGroups: mergeArrayObjects([
        primary.attendanceAnalysis?.lowAgeGroups || [],
        secondary.attendanceAnalysis?.lowAgeGroups || [],
      ], 8),
      weakWeekdays: mergeArrayObjects([
        primary.attendanceAnalysis?.weakWeekdays || [],
        secondary.attendanceAnalysis?.weakWeekdays || [],
      ], 5),
      seasonalPatterns: mergeArrayObjects([
        primary.attendanceAnalysis?.seasonalPatterns || [],
        secondary.attendanceAnalysis?.seasonalPatterns || [],
      ], 4),
    },
    coverageAnalysis: {
      ...(primary.coverageAnalysis || {}),
      lowCoverageDistricts: mergeArrayObjects([
        primary.coverageAnalysis?.lowCoverageDistricts || [],
        secondary.coverageAnalysis?.lowCoverageDistricts || [],
      ], 8),
      dataGap: uniqueStrings([
        primary.coverageAnalysis?.dataGap,
        secondary.coverageAnalysis?.dataGap,
      ]).join(' '),
    },
    parentActivityAnalysis: {
      ...(primary.parentActivityAnalysis || {}),
      risks: mergeArrayObjects([
        primary.parentActivityAnalysis?.risks || [],
        secondary.parentActivityAnalysis?.risks || [],
      ], 8),
    },
    financialAnalysis: {
      ...(primary.financialAnalysis || {}),
      outliers: mergeArrayObjects([
        primary.financialAnalysis?.outliers || [],
        secondary.financialAnalysis?.outliers || [],
      ], 8),
      dataGap: uniqueStrings([
        primary.financialAnalysis?.dataGap,
        secondary.financialAnalysis?.dataGap,
      ]).join(' '),
    },
    staffAnalysis: {
      ...(primary.staffAnalysis || {}),
      shortages: mergeArrayObjects([
        primary.staffAnalysis?.shortages || [],
        secondary.staffAnalysis?.shortages || [],
      ], 8),
    },
    nutritionAnalysis: {
      ...(primary.nutritionAnalysis || {}),
      dataGap: uniqueStrings([
        primary.nutritionAnalysis?.dataGap,
        secondary.nutritionAnalysis?.dataGap,
      ]).join(' '),
    },
    healthAnalysis: {
      ...(primary.healthAnalysis || {}),
      riskGroups: mergeArrayObjects([
        primary.healthAnalysis?.riskGroups || [],
        secondary.healthAnalysis?.riskGroups || [],
      ], 8),
    },
    ratingAnalysis: {
      topKindergartens: mergeArrayObjects([
        primary.ratingAnalysis?.topKindergartens || [],
        secondary.ratingAnalysis?.topKindergartens || [],
      ], 10),
      problematicKindergartens: mergeArrayObjects([
        primary.ratingAnalysis?.problematicKindergartens || [],
        secondary.ratingAnalysis?.problematicKindergartens || [],
      ], 10),
    },
    strategicQuestions: uniqueStrings([
      ...(primary.strategicQuestions || []),
      ...(secondary.strategicQuestions || []),
    ]).slice(0, 10),
    next24HourActions: uniqueStrings([
      ...(primary.next24HourActions || []),
      ...(secondary.next24HourActions || []),
    ]).slice(0, 10),
  };
};

const generateAIInsightAnalysis = async (provider, snapshot, requestedProvider) => {
  if (provider === 'unconfigured') {
    throw new Error(getAIProviderSetupMessage(requestedProvider));
  }
  if (provider === 'ensemble') {
    const results = await Promise.allSettled([
      callOpenAIInsights(snapshot).then((result) => ({ source: 'openai', ...result })),
      callGeminiInsights(snapshot).then((result) => ({ source: 'gemini', ...result })),
    ]);
    const fulfilled = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    if (fulfilled.length !== 2) {
      const errors = results.map((result) => result.reason?.message).filter(Boolean).join('; ');
      throw new Error(errors || 'OpenAI va Gemini ikkalasidan ham to‘liq javob kelmadi');
    }
    return {
      source: fulfilled.map((result) => result.source).join('+'),
      model: fulfilled.map((result) => result.model).join(' + '),
      providerResults: fulfilled.map((result) => ({
        source: result.source,
        model: result.model,
      })),
      analysis: mergeAIAnalyses(snapshot, fulfilled.map((result) => result.analysis)),
    };
  }
  if (provider === 'openai') {
    const result = await callOpenAIInsights(snapshot);
    return { source: 'openai', model: result.model, analysis: result.analysis };
  }
  if (provider === 'gemini') {
    const result = await callGeminiInsights(snapshot);
    return { source: 'gemini', model: result.model, analysis: result.analysis };
  }
  throw new Error('AI provider sozlanmagan');
};

const buildMedicalStockReport = async () => {
  await ensureTables();

  const kindergartens = await all(
    `SELECT id, name, district, address, phone, currentChildren
     FROM kindergartens
     ORDER BY district, name`
  );

  await Promise.all(
    kindergartens.map((kindergarten) => ensureMedicalInventoryDefaults(String(kindergarten.id)))
  );

  const today = new Date().toISOString().slice(0, 10);
  const rows = await all(
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
    [today, today, today]
  );

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
      created_at: row.created_at,
      updated_at: row.updated_at,
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

  return {
    generated_at: new Date().toISOString(),
    summary,
    items,
    issues,
  };
};

const deleteKindergartenCascade = async (kindergartenId) => {
  const tables = [
    'attendance',
    'health_checks',
    'parent_documents',
    'pickup_people',
    'daily_meal_portions',
    'staff_health_checks',
    'medical_inventory_movements',
    'medical_inventory_items',
    'inventory_batches',
    'inventory_transactions',
    'kitchen_tasks',
    'menus',
    'products',
    'lab_samples',
    'chef_sanitary_checks',
    'finance_transactions',
    'role_notifications',
    'role_accounts',
    'operations_log',
    'audits',
    'messages',
    'kindergarten_settings',
    'supply_required_products',
    'supply_plans',
    'suppliers',
    'staff',
    'children',
    'parent_accounts',
    'parents',
    'groups',
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
    const today = normalizeDate(req.query.date);
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
          SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY', 'LATE') AND (a.arrival_time IS NULL OR a.arrival_time <= '09:30') THEN 1 ELSE 0 END) as attended_before_9,
          SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY', 'LATE') AND a.arrival_time IS NOT NULL AND a.arrival_time > '09:30' THEN 1 ELSE 0 END) as attended_after_9
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

  getDistrictWarehousePurchases: async (req, res) => {
    const date = normalizeDate(req.query.date);
    const startDate = req.query.startDate ? normalizeDate(req.query.startDate) : null;
    const endDate = req.query.endDate ? normalizeDate(req.query.endDate) : null;
    try {
      await ensureAdminWarehousePurchasesTable();
      const whereSql = startDate && endDate
        ? 'WHERE date BETWEEN $1 AND $2'
        : 'WHERE date = $1';
      const params = startDate && endDate ? [startDate, endDate] : [date];
      const result = await db.pool.query(
        `SELECT id, date, district, product_name, unit, quantity, price_per_unit, note, created_at, updated_at
         FROM admin_warehouse_purchases
         ${whereSql}
         ORDER BY date, district, product_name`,
        params
      );
      res.json({
        date,
        startDate: startDate || date,
        endDate: endDate || date,
        entries: result.rows.map((row) => ({
          id: row.id,
          date: row.date,
          district: row.district,
          productName: row.product_name,
          unit: row.unit || 'kg',
          quantity: Number(row.quantity || 0),
          pricePerUnit: Number(row.price_per_unit || 0),
          totalAmount: Number(row.quantity || 0) * Number(row.price_per_unit || 0),
          note: row.note || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  saveDistrictWarehousePurchases: async (req, res) => {
    const date = normalizeDate(req.body.date);
    const entries = Array.isArray(req.body.entries) ? req.body.entries : [];

    const client = await db.pool.connect();
    try {
      await ensureAdminWarehousePurchasesTable();
      await client.query('BEGIN');
      const saved = [];
      for (const entry of entries) {
        const district = String(entry?.district || '').trim();
        const productName = String(entry?.productName ?? entry?.product_name ?? '').trim();
        if (!district || !productName) continue;
        const unit = String(entry?.unit || 'kg').trim() || 'kg';
        const quantity = toCost(entry?.quantity);
        const pricePerUnit = toCost(entry?.pricePerUnit ?? entry?.price_per_unit);
        const note = String(entry?.note || '').trim() || null;
        const id = entry?.id || crypto.randomUUID();
        const result = await client.query(
          `INSERT INTO admin_warehouse_purchases (id, date, district, product_name, unit, quantity, price_per_unit, note, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
           ON CONFLICT (date, district, product_name)
           DO UPDATE SET unit = EXCLUDED.unit,
                         quantity = EXCLUDED.quantity,
                         price_per_unit = EXCLUDED.price_per_unit,
                         note = EXCLUDED.note,
                         updated_at = CURRENT_TIMESTAMP
           RETURNING id, date, district, product_name, unit, quantity, price_per_unit, note, created_at, updated_at`,
          [id, date, district, productName, unit, quantity, pricePerUnit, note]
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
          productName: row.product_name,
          unit: row.unit || 'kg',
          quantity: Number(row.quantity || 0),
          pricePerUnit: Number(row.price_per_unit || 0),
          totalAmount: Number(row.quantity || 0) * Number(row.price_per_unit || 0),
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
      res.json(await buildMedicalStockReport());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getAIInsights: async (req, res) => {
    const date = normalizeDate(req.query.date);
    const refresh = ['1', 'true', 'yes'].includes(String(req.query.refresh || '').toLowerCase());
    try {
      await ensureAdminAIInsightsTable();
      const provider = resolveAIProvider(req.query.provider);
      const cacheKey = `${date}:${provider}`;
      const snapshot = await buildAdminAIInsightSnapshot(date);

      if (Number(snapshot?.totals?.marked || 0) <= 0) {
        return res.status(422).json({
          date,
          source: provider,
          model: null,
          cached: false,
          error: 'Bugungi davomat maʼlumotlari kiritilmagan. AI xulosa shakllantirilmaydi.',
          analysis: null,
          snapshot,
        });
      }

      if (!refresh) {
        const cached = await get(
          `SELECT cache_key, date, provider, model, analysis_json, snapshot_json, generated_at, expires_at
           FROM admin_ai_insight_cache
           WHERE cache_key = ? AND expires_at > CURRENT_TIMESTAMP`,
          [cacheKey]
        );
        if (cached) {
          return res.json({
            date: cached.date,
            source: cached.provider,
            model: cached.model,
            cached: true,
            generatedAt: cached.generated_at,
            expiresAt: cached.expires_at,
            analysis: JSON.parse(cached.analysis_json),
            snapshot: JSON.parse(cached.snapshot_json),
          });
        }
      }

      try {
        const generated = await generateAIInsightAnalysis(provider, snapshot, req.query.provider);
        const generatedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await run(
          `INSERT INTO admin_ai_insight_cache (
            cache_key, date, provider, model, analysis_json, snapshot_json, generated_at, expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (cache_key)
          DO UPDATE SET
            model = EXCLUDED.model,
            analysis_json = EXCLUDED.analysis_json,
            snapshot_json = EXCLUDED.snapshot_json,
            generated_at = EXCLUDED.generated_at,
            expires_at = EXCLUDED.expires_at`,
          [
            cacheKey,
            date,
            generated.source,
            generated.model,
            JSON.stringify(generated.analysis),
            JSON.stringify(snapshot),
            generatedAt,
            expiresAt,
          ]
        );

        return res.json({
          date,
          source: generated.source,
          model: generated.model,
          providerResults: generated.providerResults || [],
          cached: false,
          generatedAt,
          expiresAt,
          analysis: generated.analysis,
          snapshot,
        });
      } catch (aiError) {
        const fallbackAnalysis = buildLocalAIInsightAnalysis(snapshot, aiError.message);
        const generatedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        const fallbackSource = `${provider}:local-fallback`;
        const fallbackModel = 'local-snapshot-analysis';

        await run(
          `INSERT INTO admin_ai_insight_cache (
            cache_key, date, provider, model, analysis_json, snapshot_json, generated_at, expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (cache_key)
          DO UPDATE SET
            model = EXCLUDED.model,
            analysis_json = EXCLUDED.analysis_json,
            snapshot_json = EXCLUDED.snapshot_json,
            generated_at = EXCLUDED.generated_at,
            expires_at = EXCLUDED.expires_at`,
          [
            cacheKey,
            date,
            fallbackSource,
            fallbackModel,
            JSON.stringify(fallbackAnalysis),
            JSON.stringify(snapshot),
            generatedAt,
            expiresAt,
          ]
        );

        return res.json({
          date,
          source: fallbackSource,
          model: fallbackModel,
          cached: false,
          warning: summarizeAIProviderError(aiError.message),
          providerError: aiError.message,
          analysis: fallbackAnalysis,
          snapshot,
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getAlerts: async (req, res) => {
    try {
      await ensureAdminAlertEventsTable();
      const generatedAt = new Date().toISOString();
      const pageSize = Math.min(Math.max(Number(req.query.pageSize || 50), 1), 50);
      const page = Math.max(Number(req.query.page || 1), 1);
      const filter = String(req.query.filter || 'all').toLowerCase();
      const search = String(req.query.search || '').trim().toLowerCase();

      const [eventRows, menuRows, medicalReport] = await Promise.all([
        all(`
          SELECT *
          FROM admin_alert_events
          ORDER BY created_at DESC
          LIMIT 5000
        `),
        all(`
          SELECT
            m.date,
            MIN(COALESCE(m.created_at, CURRENT_TIMESTAMP)) as created_at,
            COUNT(*) as menu_count,
            COUNT(DISTINCT m.kindergarten_id) as kindergarten_count,
            COUNT(DISTINCT m.meal_type) as meal_type_count,
            STRING_AGG(DISTINCT NULLIF(k.district, ''), ', ') as districts
          FROM menus m
          LEFT JOIN kindergartens k ON CAST(k.id AS TEXT) = CAST(m.kindergarten_id AS TEXT)
          GROUP BY m.date
          ORDER BY MIN(COALESCE(m.created_at, CURRENT_TIMESTAMP)) DESC, m.date DESC
          LIMIT 500
        `),
        buildMedicalStockReport(),
      ]);

      const eventAlerts = eventRows.map((row) => ({
        id: `event-${row.id}`,
        status: row.status,
        category: row.category,
        iconKey: row.category,
        title: row.title,
        context: row.context || '',
        actor: row.actor || 'Admin',
        createdAt: toIsoTimestamp(row.created_at, generatedAt),
        actionUrl: row.action_url || undefined,
        eventType: row.event_type,
        entityType: row.entity_type,
        entityId: row.entity_id,
        details: parseAlertDetails(row.details_json),
      }));

      const medicalStatusLabels = {
        EXPIRED: 'muddati tugagan',
        EMPTY: 'tugagan',
        LOW: 'yetishmayapti',
        EXPIRING: 'muddati yaqin',
        NOT_ENTERED: 'zaxirasi kiritilmagan',
      };

      const medicalAlerts = medicalReport.issues
        .filter((item) => item.status !== 'NOT_ENTERED')
        .map((item) => {
        const isCritical = ['EXPIRED', 'EMPTY'].includes(item.status);
        const requiredQuantity = Number(item.required_quantity || 0);
        const currentQuantity = Number(item.current_quantity || 0);
        return {
          id: `medical-${item.kindergarten_id}-${item.id}-${item.status}`,
          status: isCritical ? 'error' : 'warning',
          category: 'medical',
          iconKey: 'medical',
          title: `${item.kindergarten_name}: ${item.name} ${medicalStatusLabels[item.status] || 'tekshiruv talab qiladi'}`,
          context: `${item.district || 'Tuman kiritilmagan'} | qoldiq ${currentQuantity}/${requiredQuantity} ${item.unit || ''}`.trim(),
          actor: 'Hamshira / Ombor',
          createdAt: toIsoTimestamp(item.updated_at || item.created_at, generatedAt),
          actionUrl: '/admin/medical-stock',
          details: [
            { label: 'Bogcha', value: item.kindergarten_name || 'Kiritilmagan' },
            { label: 'Dori', value: item.name || 'Kiritilmagan' },
            { label: 'Shakli', value: item.form || 'Kiritilmagan' },
            { label: 'Qoldiq', value: `${currentQuantity} ${item.unit || ''}`.trim() },
            { label: 'Talab', value: requiredQuantity > 0 ? `${requiredQuantity} ${item.unit || ''}`.trim() : item.required_label || 'Kiritilmagan' },
            { label: 'Muddat', value: item.oldest_expired_date || item.nearest_expiry_date || 'Kiritilmagan' },
            { label: 'Telefon', value: item.phone || 'Kiritilmagan' },
          ],
        };
      });

      const menuAlerts = menuRows.map((row) => ({
        id: `menu-created-${row.date}`,
        status: 'update',
        category: 'menu',
        iconKey: 'menu',
        title: `${row.date} kunlik taomnoma yaratildi`,
        context: `${Number(row.kindergarten_count || 0)} ta MTT | ${Number(row.meal_type_count || 0)} mahal | ${Number(row.menu_count || 0)} ta menyu yozuvi`,
        actor: 'Taomnoma moduli',
        createdAt: toIsoTimestamp(row.created_at, generatedAt),
        actionUrl: '/admin/menu',
        details: [
          { label: 'Sana', value: row.date },
          { label: 'MTT soni', value: String(Number(row.kindergarten_count || 0)) },
          { label: 'Menyu yozuvi', value: String(Number(row.menu_count || 0)) },
          { label: 'Ovqatlanish turi', value: String(Number(row.meal_type_count || 0)) },
          { label: 'Tumanlar', value: row.districts || 'Barcha tumanlar' },
        ],
      }));

      const alerts = [...eventAlerts, ...medicalAlerts, ...menuAlerts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const matchesFilter = (alert) => {
        if (filter === 'kindergarten') return alert.category === 'kindergarten';
        if (filter === 'medical') return alert.category === 'medical';
        if (filter === 'menu') return alert.category === 'menu';
        if (filter === 'important') return ['error', 'warning'].includes(alert.status);
        return true;
      };

      const matchesSearch = (alert) => {
        if (!search) return true;
        const detailText = (alert.details || []).map((detail) => `${detail.label} ${detail.value}`).join(' ');
        return [
          alert.title,
          alert.context,
          alert.actor,
          alert.category,
          alert.status,
          alert.eventType,
          detailText,
        ].join(' ').toLowerCase().includes(search);
      };

      const visibleAlerts = alerts.filter((alert) => matchesFilter(alert) && matchesSearch(alert));
      const total = visibleAlerts.length;
      const totalPages = Math.max(Math.ceil(total / pageSize), 1);
      const safePage = Math.min(page, totalPages);
      const offset = (safePage - 1) * pageSize;
      const pagedAlerts = visibleAlerts.slice(offset, offset + pageSize).map((alert, index) => ({
        ...alert,
        orderNumber: offset + index + 1,
      }));

      res.json({
        generated_at: generatedAt,
        summary: {
          total: alerts.length,
          critical: alerts.filter((alert) => alert.status === 'error').length,
          warning: alerts.filter((alert) => alert.status === 'warning').length,
          kindergartens: alerts.filter((alert) => alert.category === 'kindergarten').length,
          medical: alerts.filter((alert) => alert.category === 'medical').length,
          menus: alerts.filter((alert) => alert.category === 'menu').length,
        },
        pagination: {
          page: safePage,
          pageSize,
          total,
          totalPages,
          from: total ? offset + 1 : 0,
          to: total ? offset + pagedAlerts.length : 0,
          hasPrev: safePage > 1,
          hasNext: safePage < totalPages,
        },
        alerts: pagedAlerts,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById: (req, res) => {
    const today = normalizeDate(req.query.date);
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
          SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY', 'LATE') AND (a.arrival_time IS NULL OR a.arrival_time <= '09:30') THEN 1 ELSE 0 END) as attended_before_9,
          SUM(CASE WHEN UPPER(a.status) IN ('PRESENT', 'KELDI', 'EARLY', 'LATE') AND a.arrival_time IS NOT NULL AND a.arrival_time > '09:30' THEN 1 ELSE 0 END) as attended_after_9
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

  analyzeDishPage: async (req, res) => {
    try {
      const imageDataUrl = String(req.body.imageDataUrl || '');
      if (!imageDataUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Kitob sahifasi rasmi yuborilmadi' });
      }

      const result = await analyzeDishPageWithAI(imageDataUrl, req.body.provider || req.query.provider);
      res.json(result);
    } catch (error: any) {
      res.status(503).json({
        error: summarizeAIProviderError(error.message) || 'Kitob sahifasini AI tahlil qila olmadi',
      });
    }
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
    res.status(409).json({
      error: 'Aqlvoy oshpaz taomlar bazasi doimiy saqlanadi. Taomlarni o\'chirish mumkin emas.',
    });
  },

  createTenDayMenus: (req, res) => {
    const { kindergartenId, targetType = 'ALL', targetWorkHourGroup = 'ALL', days } = req.body;

    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: 'days are required' });
    }

    const normalizedType = String(targetType || 'ALL').toUpperCase();
    const normalizedWorkHourGroup = String(targetWorkHourGroup || 'ALL').toUpperCase();
    const workHourGroup = WORK_HOUR_GROUPS[normalizedWorkHourGroup];
    const typeWhere = kindergartenId
      ? 'WHERE id = ?'
      : normalizedType === 'ALL'
        ? workHourGroup
          ? `WHERE workHours IN (${workHourGroup.hours.map(() => '?').join(',')})`
          : ''
        : workHourGroup
          ? `WHERE UPPER(type) = ? AND workHours IN (${workHourGroup.hours.map(() => '?').join(',')})`
          : 'WHERE UPPER(type) = ?';
    const typeParams = kindergartenId
      ? [kindergartenId]
      : normalizedType === 'ALL'
        ? workHourGroup
          ? workHourGroup.hours
          : []
        : workHourGroup
          ? [normalizedType, ...workHourGroup.hours]
          : [normalizedType];

    db.all(`SELECT id, workHours FROM kindergartens ${typeWhere}`, typeParams, (kindergartenErr, kindergartenRows = []) => {
      if (kindergartenErr) {
        return res.status(500).json({ error: kindergartenErr.message });
      }
      if (kindergartenRows.length === 0) {
        return res.status(400).json({ error: 'No kindergartens found for selected type' });
      }

      const targetIds = kindergartenRows.map((row) => row.id);
      const menuRows = [];
      kindergartenRows.forEach((kindergarten) => {
        const allowedMealTypes = new Set(mealTypesForWorkHours(kindergarten.workHours));
        days.forEach((day) => {
          Object.entries(day.meals || {}).forEach(([mealType, meal]) => {
            if (!allowedMealTypes.has(mealType)) return;
            const mealData = typeof meal === 'string' ? { meal_name: meal } : (meal || {});
            if (!mealData.meal_name || !String(mealData.meal_name).trim()) return;
            menuRows.push({
              id: crypto.randomUUID(),
              kindergartenId: kindergarten.id,
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

        db.run("COMMIT", async (err) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }
          try {
            await recordAdminAlertEvent({
              eventType: 'KINDERGARTEN_CREATED',
              category: 'kindergarten',
              status: 'success',
              title: `Yangi bog'cha qo'shildi: ${data.name}`,
              context: `${data.district || 'Tuman kiritilmagan'} | ${data.system_id || `#${kindergartenId}`} | ${workHours} soatlik MTT`,
              actor: 'Admin',
              entityType: 'kindergarten',
              entityId: kindergartenId,
              actionUrl: '/admin/kindergartens',
              details: [
                { label: 'MTT ID', value: data.system_id || 'Kiritilmagan' },
                { label: 'Direktor', value: data.directorName || 'Kiritilmagan' },
                { label: 'Telefon', value: data.phone || 'Kiritilmagan' },
                { label: "Sig'im", value: `${Number(data.capacity || 0)} o'rin` },
                { label: 'Login', value: data.username || 'Kiritilmagan' },
              ],
            });
          } catch (eventError) {
            console.error('Kindergarten create alert event error:', eventError.message);
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
    ], async function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      try {
        await recordAdminAlertEvent({
          eventType: 'KINDERGARTEN_UPDATED',
          category: 'kindergarten',
          status: 'update',
          title: `Bog'cha ma'lumotlari yangilandi: ${data.name || `#${req.params.id}`}`,
          context: `${data.district || 'Tuman kiritilmagan'} | ${data.system_id || `#${req.params.id}`} | ${workHours} soatlik MTT`,
          actor: 'Admin',
          entityType: 'kindergarten',
          entityId: req.params.id,
          actionUrl: '/admin/kindergartens',
          details: [
            { label: 'MTT ID', value: data.system_id || 'Kiritilmagan' },
            { label: 'Direktor', value: data.directorName || 'Kiritilmagan' },
            { label: 'Telefon', value: data.phone || 'Kiritilmagan' },
            { label: "Sig'im", value: `${Number(data.capacity || 0)} o'rin` },
            { label: 'Login', value: data.username || 'Kiritilmagan' },
          ],
        });
      } catch (eventError) {
        console.error('Kindergarten update alert event error:', eventError.message);
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
      const existing = await get(
        `SELECT id, system_id, name, district, directorName as director_name, phone, capacity, username, created_at
         FROM kindergartens
         WHERE id = ?`,
        [kindergartenId]
      );
      if (!existing) {
        return res.status(404).json({ error: 'Kindergarten not found' });
      }

      const deleted = await deleteKindergartenCascade(kindergartenId);
      if (!deleted) {
        return res.status(404).json({ error: 'Kindergarten not found' });
      }
      try {
        await recordAdminAlertEvent({
          eventType: 'KINDERGARTEN_DELETED',
          category: 'kindergarten',
          status: 'error',
          title: `Bog'cha o'chirildi: ${existing.name}`,
          context: `${existing.district || 'Tuman kiritilmagan'} | ${existing.system_id || `#${kindergartenId}`} | ma'lumotlar arxivdan olib tashlandi`,
          actor: 'Admin',
          entityType: 'kindergarten',
          entityId: kindergartenId,
          actionUrl: '/admin/kindergartens',
          details: [
            { label: 'MTT ID', value: existing.system_id || 'Kiritilmagan' },
            { label: 'Direktor', value: existing.director_name || 'Kiritilmagan' },
            { label: 'Telefon', value: existing.phone || 'Kiritilmagan' },
            { label: "Sig'im", value: `${Number(existing.capacity || 0)} o'rin` },
            { label: 'Login', value: existing.username || 'Kiritilmagan' },
          ],
        });
      } catch (eventError) {
        console.error('Kindergarten delete alert event error:', eventError.message);
      }
      res.json({ message: 'Deleted successfully', id: req.params.id });
    } catch (err) {
      console.error('Kindergarten delete error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

export default KindergartenController;
