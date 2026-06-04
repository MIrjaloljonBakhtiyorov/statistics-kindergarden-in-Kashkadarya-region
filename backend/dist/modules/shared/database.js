import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();
const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required. PostgreSQL is the only supported database.');
}
const normalizeParams = (params, callback) => {
    if (typeof params === 'function') {
        return { params: [], callback: params };
    }
    return { params: params || [], callback };
};
const replaceQuestionParams = (sql) => {
    let index = 0;
    let quote = null;
    let result = '';
    for (let i = 0; i < sql.length; i += 1) {
        const char = sql[i];
        const prev = sql[i - 1];
        if ((char === "'" || char === '"') && prev !== '\\') {
            quote = quote === char ? null : quote || char;
        }
        if (char === '?' && !quote) {
            index += 1;
            result += `$${index}`;
        }
        else {
            result += char;
        }
    }
    return result;
};
const toPostgresSql = (sql) => {
    let next = sql.trim();
    next = next.replace(/datetime\('now',\s*'-'\s*\|\|\s*\?\s*\|\|\s*'\s*days'\)/gi, "NOW() - (? || ' days')::interval");
    next = next.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
    next = next.replace(/\bDATETIME\b/gi, 'TIMESTAMP');
    next = next.replace(/\bREAL\b/gi, 'DOUBLE PRECISION');
    next = next.replace(/BOOLEAN/gi, 'INTEGER');
    next = next.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
    next = next.replace(/INSERT OR REPLACE INTO/gi, 'INSERT INTO');
    next = replaceQuestionParams(next);
    next = next.replace(/trim\(\$(\d+)\)/gi, 'trim($$$1::text)');
    next = next.replace(/\$(\d+)\s+IS\s+(NOT\s+)?NULL/gi, '$$$1::text IS $2NULL');
    return next;
};
const shouldReturnId = (sql) => /^INSERT\s+INTO\s+kindergartens\b/i.test(sql) && !/\bRETURNING\b/i.test(sql);
const postgresColumnAliases = {
    licensefile: 'licenseFile',
    brokeragedocumentfile: 'brokerageDocumentFile',
    directorname: 'directorName',
    directorbirthyear: 'directorBirthYear',
    directorphoto: 'directorPhoto',
    commissionorder: 'commissionOrder',
    commissionapproveddate: 'commissionApprovedDate',
    commissionvaliduntil: 'commissionValidUntil',
    workhours: 'workHours',
    currentchildren: 'currentChildren',
    techstaff: 'techStaff',
    nursecount: 'nurseCount',
    hasnurse: 'hasNurse',
    mealtype: 'mealType',
    kitcheneq: 'kitchenEq',
    haskitchen: 'hasKitchen',
    hasallergymenu: 'hasAllergyMenu',
    hasdietmenu: 'hasDietMenu',
    haswarehouse: 'hasWarehouse',
    warehousemanager: 'warehouseManager',
    avgconsumption: 'avgConsumption',
    financetype: 'financeType',
    aimonitoring: 'aiMonitoring',
    childrencount: 'childrenCount',
    actualchildrencount: 'actualChildrenCount',
    staffcount: 'staffCount',
    attendedbefore9: 'attendedBefore9',
    attendedafter9: 'attendedAfter9',
    attendancepercentage: 'attendancePercentage',
    kindergartenname: 'kindergartenName',
    kindergartentype: 'kindergartenType',
    kindergartendistrict: 'kindergartenDistrict',
    kindergartenaddress: 'kindergartenAddress',
    childgroup: 'childGroup',
    fathername: 'fatherName',
    fatherphone: 'fatherPhone',
    fatherpassport: 'fatherPassport',
    fatherworkplace: 'fatherWorkplace',
    mothername: 'motherName',
    motherphone: 'motherPhone',
    motherpassport: 'motherPassport',
    motherworkplace: 'motherWorkplace',
};
const mapPostgresRow = (row) => {
    if (!row)
        return row;
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [postgresColumnAliases[key] || key, value]));
};
const pool = new Pool({ connectionString: databaseUrl });
let activeQueue = null;
const rawQuery = async (sql, params = []) => {
    let text = toPostgresSql(sql);
    if (shouldReturnId(text))
        text += ' RETURNING id';
    return pool.query(text, params);
};
const query = (sql, params = []) => {
    const task = () => rawQuery(sql, params);
    if (!activeQueue)
        return task();
    const current = activeQueue.then(task, task);
    activeQueue = current.catch(() => undefined);
    return current;
};
export const db = {
    dialect: 'postgres',
    pool,
    serialize(fn) {
        const previousQueue = activeQueue;
        activeQueue = Promise.resolve();
        fn();
        activeQueue
            .finally(() => {
            activeQueue = previousQueue;
        })
            .catch(() => {
            activeQueue = previousQueue;
        });
    },
    run(sql, params, callback) {
        const normalized = normalizeParams(params, callback);
        query(sql, normalized.params)
            .then((result) => {
            normalized.callback?.call({
                lastID: result.rows?.[0]?.id,
                changes: result.rowCount || 0,
            }, null);
        })
            .catch((error) => normalized.callback?.(error));
    },
    all(sql, params, callback) {
        const normalized = normalizeParams(params, callback);
        query(sql, normalized.params)
            .then((result) => normalized.callback?.(null, result.rows.map(mapPostgresRow)))
            .catch((error) => normalized.callback?.(error));
    },
    get(sql, params, callback) {
        const normalized = normalizeParams(params, callback);
        query(sql, normalized.params)
            .then((result) => normalized.callback?.(null, mapPostgresRow(result.rows[0])))
            .catch((error) => normalized.callback?.(error));
    },
    prepare(sql) {
        let queue = Promise.resolve();
        return {
            run(params, callback) {
                const normalized = normalizeParams(params, callback);
                queue = queue
                    .then(() => query(sql, normalized.params))
                    .then((result) => normalized.callback?.call({ changes: result.rowCount || 0 }, null))
                    .catch((error) => normalized.callback?.(error));
            },
            finalize(callback) {
                queue.then(() => callback?.(null)).catch((error) => callback?.(error));
            },
        };
    },
};
pool.query('SELECT 1')
    .then(() => console.log('Connected to PostgreSQL database.'))
    .catch((error) => console.error('Error connecting to PostgreSQL database:', error.message));
export default db;
