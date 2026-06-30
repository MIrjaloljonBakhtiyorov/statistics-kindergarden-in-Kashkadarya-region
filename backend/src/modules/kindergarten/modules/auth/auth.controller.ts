import { Request, Response } from 'express';
import { db } from '../../db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { env } from '../../../../config/env.js';
import { normalizeLogin } from '../../../shared/loginUniqueness.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d[\d\s-]{7,18}$/;

const normalizeEmail = (email: unknown) => String(email || '').trim().toLowerCase();

const run = (sql: string, params: any[] = []) =>
  new Promise<{ lastID?: number; changes?: number }>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const get = <T = any>(sql: string, params: any[] = []) =>
  new Promise<T | undefined>((resolve, reject) => {
    db.get<T>(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const createTransporter = () => {
  if (!env.smtp.user || !env.smtp.pass || !env.smtp.from) {
    throw new Error('SMTP sozlamalari toʼliq emas: SMTP_USER, SMTP_PASS va SMTP_FROM kiriting');
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
};

export class AuthController {
  login = async (req: Request, res: Response) => {
    const { login, password } = req.body;
    const normalizedLogin = normalizeLogin(login);

    db.get('SELECT * FROM kindergartens WHERE lower(trim(username)) = ? AND password = ?', [normalizedLogin, password], (err, user: any) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) {
        db.get(
          `SELECT ra.*, k.name as kindergarten_name
           FROM role_accounts ra
           LEFT JOIN kindergartens k ON k.id = ra.kindergarten_id
           WHERE lower(trim(ra.login)) = ?
             AND ra.role IN (
               'OPERATOR', 'TEACHER', 'NURSE', 'CHEF', 'STOREKEEPER', 'INSPECTOR'
             )
           LIMIT 1`,
          [normalizedLogin],
          async (roleErr, roleUser: any) => {
            if (roleErr) {
              if (roleErr.message.includes('no such table')) {
                return res.status(401).json({ error: 'Invalid login or password' });
              }
              return res.status(500).json({ error: roleErr.message });
            }
            if (!roleUser) return res.status(401).json({ error: 'Invalid login or password' });

            const ok = await bcrypt.compare(password, roleUser.password_hash);
            if (!ok) return res.status(401).json({ error: 'Invalid login or password' });

            return res.json({
              id: roleUser.id,
              kindergarten_id: roleUser.kindergarten_id,
              login: roleUser.login,
              role: roleUser.role,
              full_name: roleUser.full_name || roleUser.kindergarten_name || roleUser.login
            });
          }
        );
        return;
      }

      res.json({
        id: user.id,
        kindergarten_id: user.id,
        login: user.username,
        role: 'DIRECTOR', // Default role for now
        full_name: user.directorName
      });
    });
  };

  parentLogin = async (req: Request, res: Response) => {
    const { login, password } = req.body;
    const normalizedLogin = normalizeLogin(login);

    db.get(`
      SELECT pa.*, c.id as child_id, p.full_name
      FROM parent_accounts pa
      LEFT JOIN children c ON c.parent_account_id = pa.id
      LEFT JOIN parents p ON p.child_id = c.id OR p.id = c.father_id OR p.id = c.mother_id
      WHERE lower(trim(pa.login)) = ?
      LIMIT 1
    `, [normalizedLogin], async (err, user: any) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'Invalid login or password' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid login or password' });

      res.json({
        id: user.id,
        login: user.login,
        role: 'PARENT',
        full_name: user.full_name || user.login,
        childId: user.child_id,
        kindergarten_id: user.kindergarten_id,
      });
    });
  };

  sendEmailCode = async (req: Request, res: Response) => {
    try {
      const email = normalizeEmail(req.body.email);
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: "Email noto'g'ri kiritilgan" });
      }

      const existingUser = await get('SELECT id FROM users WHERE lower(trim(email)) = ? LIMIT 1', [email]);
      if (existingUser) {
        return res.status(409).json({ error: 'Bu email bilan user roʼyxatdan oʼtgan' });
      }

      const recentCode = await get<any>(
        `SELECT created_at FROM email_verification_codes
         WHERE lower(trim(email)) = ? AND purpose = 'register'
         ORDER BY created_at DESC
         LIMIT 1`,
        [email]
      );
      if (recentCode?.created_at) {
        const createdAt = new Date(recentCode.created_at).getTime();
        if (Number.isFinite(createdAt) && Date.now() - createdAt < 60_000) {
          return res.status(429).json({ error: 'Kodni qayta yuborish uchun 1 daqiqa kuting' });
        }
      }

      const code = String(crypto.randomInt(100000, 1000000));
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

      await run(
        `INSERT INTO email_verification_codes (id, email, code_hash, purpose, expires_at)
         VALUES (?, ?, ?, 'register', ?)`,
        [crypto.randomUUID(), email, codeHash, expiresAt]
      );

      const transporter = createTransporter();
      await transporter.sendMail({
        from: env.smtp.from,
        to: email,
        subject: "Ro'yxatdan o'tish tasdiqlash kodi",
        text: `Tasdiqlash kodingiz: ${code}. Kod 10 daqiqa amal qiladi.`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
            <h2>Ro'yxatdan o'tish kodi</h2>
            <p>Tasdiqlash kodingiz:</p>
            <div style="font-size:28px;font-weight:800;letter-spacing:6px">${code}</div>
            <p>Ushbu kod 10 daqiqa amal qiladi.</p>
          </div>
        `,
      });

      res.json({ success: true, email, expiresInSeconds: 600 });
    } catch (err: any) {
      console.error('Send email code error:', err);
      res.status(500).json({ error: err.message || 'Email kodi yuborilmadi' });
    }
  };

  registerUser = async (req: Request, res: Response) => {
    try {
      const firstName = String(req.body.firstName || req.body.first_name || '').trim();
      const lastName = String(req.body.lastName || req.body.last_name || '').trim();
      const email = normalizeEmail(req.body.email);
      const phone = String(req.body.phone || '').trim();
      const password = String(req.body.password || '');
      const code = String(req.body.code || '').trim();
      const passportFileUrl = String(req.body.passportFileUrl || req.body.passport_file_url || '').trim();

      if (firstName.length < 2) return res.status(400).json({ error: 'Ism kamida 2 ta belgidan iborat boʼlishi kerak' });
      if (lastName.length < 2) return res.status(400).json({ error: 'Familiya kamida 2 ta belgidan iborat boʼlishi kerak' });
      if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Email noto'g'ri kiritilgan" });
      if (!PHONE_RE.test(phone)) return res.status(400).json({ error: "Telefon noto'g'ri kiritilgan" });
      if (password.length < 6) return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat boʼlishi kerak' });
      if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: '6 xonali kodni kiriting' });
      if (!passportFileUrl) return res.status(400).json({ error: 'Passport faylini yuklang' });

      const existingUser = await get('SELECT id FROM users WHERE lower(trim(email)) = ? LIMIT 1', [email]);
      if (existingUser) return res.status(409).json({ error: 'Bu email bilan user roʼyxatdan oʼtgan' });

      const verification = await get<any>(
        `SELECT * FROM email_verification_codes
         WHERE lower(trim(email)) = ?
           AND purpose = 'register'
           AND COALESCE(used, 0) = 0
         ORDER BY created_at DESC
         LIMIT 1`,
        [email]
      );

      if (!verification) return res.status(400).json({ error: 'Avval emailga kod yuboring' });
      if (Number(verification.attempts || 0) >= 5) return res.status(429).json({ error: 'Urinishlar soni tugadi. Kodni qayta yuboring' });
      if (new Date(verification.expires_at).getTime() < Date.now()) {
        return res.status(400).json({ error: 'Kod muddati tugagan. Qayta kod yuboring' });
      }

      const codeOk = await bcrypt.compare(code, verification.code_hash);
      if (!codeOk) {
        await run('UPDATE email_verification_codes SET attempts = COALESCE(attempts, 0) + 1 WHERE id = ?', [verification.id]);
        return res.status(400).json({ error: "Kod noto'g'ri" });
      }

      const id = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(password, 10);
      await run(
        `INSERT INTO users (
          id, first_name, last_name, email, phone, password_hash,
          passport_file_url, role, email_verified, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'user', 1, CURRENT_TIMESTAMP)`,
        [id, firstName, lastName, email, phone, passwordHash, passportFileUrl]
      );
      await run('UPDATE email_verification_codes SET used = 1 WHERE id = ?', [verification.id]);

      res.status(201).json({
        id,
        email,
        role: 'user',
        full_name: `${firstName} ${lastName}`,
      });
    } catch (err: any) {
      console.error('Register user error:', err);
      if (String(err.message || '').includes('UNIQUE')) {
        return res.status(409).json({ error: 'Bu email bilan user roʼyxatdan oʼtgan' });
      }
      res.status(500).json({ error: err.message || 'Roʼyxatdan oʼtishda xatolik' });
    }
  };

  userLogin = async (req: Request, res: Response) => {
    try {
      const email = normalizeEmail(req.body.email || req.body.login);
      const password = String(req.body.password || '');
      if (!EMAIL_RE.test(email) || !password) {
        return res.status(400).json({ error: 'Email va parolni kiriting' });
      }

      const user = await get<any>('SELECT * FROM users WHERE lower(trim(email)) = ? LIMIT 1', [email]);
      if (!user) return res.status(401).json({ error: 'Email yoki parol notoʼgʼri' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Email yoki parol notoʼgʼri' });

      res.json({
        id: user.id,
        login: user.email,
        email: user.email,
        role: user.role || 'user',
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        phone: user.phone,
        passportFileUrl: user.passport_file_url,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login xatosi' });
    }
  };
}
