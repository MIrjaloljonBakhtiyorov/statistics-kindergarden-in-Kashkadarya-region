const RESERVED_LOGINS = new Set(['m_login']);

export const normalizeLogin = (login: unknown): string => {
  return String(login || '').trim().toLowerCase().replace(/\s+/g, '');
};

const get = <T = any>(db: any, sql: string, params: any[] = []) => new Promise<T | undefined>((resolve, reject) => {
  db.get(sql, params, (err: Error | null, row: T | undefined) => err ? reject(err) : resolve(row));
});

export const isLoginAvailable = async (
  db: any,
  login: unknown,
  options: { excludeParentAccountId?: string; excludeKindergartenId?: string | number; excludeRoleAccountId?: string } = {}
): Promise<boolean> => {
  const normalized = normalizeLogin(login);
  if (!normalized || RESERVED_LOGINS.has(normalized)) return false;

  const parentAccount = await get<{ id: string }>(
    db,
    `SELECT id
     FROM parent_accounts
     WHERE lower(trim(login)) = ?
       AND (? IS NULL OR id <> ?)
     LIMIT 1`,
    [normalized, options.excludeParentAccountId || null, options.excludeParentAccountId || null]
  );
  if (parentAccount) return false;

  const roleAccount = await get<{ id: string }>(
    db,
    `SELECT id
     FROM role_accounts
     WHERE lower(trim(login)) = ?
       AND (? IS NULL OR id <> ?)
     LIMIT 1`,
    [normalized, options.excludeRoleAccountId || null, options.excludeRoleAccountId || null]
  ).catch((error) => {
    if (String(error?.message || '').includes('no such table')) return undefined;
    throw error;
  });
  if (roleAccount) return false;

  const kindergarten = await get<{ id: number }>(
    db,
    `SELECT id
     FROM kindergartens
     WHERE lower(trim(username)) = ?
       AND (? IS NULL OR CAST(id AS TEXT) <> CAST(? AS TEXT))
     LIMIT 1`,
    [
      normalized,
      options.excludeKindergartenId == null ? null : String(options.excludeKindergartenId),
      options.excludeKindergartenId == null ? null : String(options.excludeKindergartenId),
    ]
  );

  return !kindergarten;
};

export const assertLoginAvailable = async (
  db: any,
  login: unknown,
  options: { excludeParentAccountId?: string; excludeKindergartenId?: string | number; excludeRoleAccountId?: string } = {}
) => {
  const normalized = normalizeLogin(login);
  if (!normalized) {
    throw new Error('Login kiritilishi shart');
  }

  if (!(await isLoginAvailable(db, normalized, options))) {
    throw new Error('Bu login butun tizimda band. Boshqa login kiriting.');
  }

  return normalized;
};

export const findAvailableLogin = async (db: any, baseLogin: unknown): Promise<string> => {
  const base = normalizeLogin(baseLogin);
  if (!base) throw new Error('Login yaratish uchun maʼlumot yetarli emas');

  let counter = 0;
  while (counter < 1000) {
    const candidate = counter === 0 ? base : `${base}${counter}`;
    if (await isLoginAvailable(db, candidate)) return candidate;
    counter += 1;
  }

  throw new Error('Unikal login yaratib boʼlmadi. Iltimos, loginni qoʼlda kiriting.');
};
