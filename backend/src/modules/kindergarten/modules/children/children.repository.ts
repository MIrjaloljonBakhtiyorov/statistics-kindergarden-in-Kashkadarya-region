import { db } from '../../db.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OperationsRepository } from '../operations/operations.repository.js';
import { assertLoginAvailable, findAvailableLogin, normalizeLogin } from '../../../shared/loginUniqueness.js';

const nullableNumber = (value: unknown) => {
  if (value === '' || value == null) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export class ChildrenRepository {
  async create(data: any, kindergartenId: string): Promise<any> {
    const childId = crypto.randomUUID();
    const fatherId = crypto.randomUUID();
    const motherId = crypto.randomUUID();
    const accountId = crypto.randomUUID();

    const run = (sql: string, params: any[] = []) => new Promise<void>((res, rej) => {
      db.run(sql, params, (err) => err ? rej(err) : res());
    });

    let transactionStarted = false;
    try {
      // Unikal login yaratish: ism + yil (masalan: mirjalol2003)
      const birthYear = Number.isFinite(new Date(data.birth_date).getFullYear())
        ? new Date(data.birth_date).getFullYear()
        : new Date().getFullYear();
      const hasCustomLogin = Boolean(data.parent_login && String(data.parent_login).trim() !== '');
      const baseLogin = hasCustomLogin
        ? data.parent_login
        : `${String(data.first_name || '').toLowerCase().replace(/\s+/g, '')}${birthYear}`;

      const finalLogin = hasCustomLogin
        ? await assertLoginAvailable(db, baseLogin)
        : await findAvailableLogin(db, baseLogin);

      const password = Math.random().toString(36).slice(-8); // Simplified for now
      const passwordHash = await bcrypt.hash(password, 10);
      const groupId = data.group_id && data.group_id !== '' ? data.group_id : null;

      await run('BEGIN TRANSACTION');
      transactionStarted = true;
      await run(
        'INSERT INTO parents (id, full_name, workplace, phone, passport_no, role, kindergarten_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [fatherId, data.father_full_name, data.father_workplace, data.father_phone || null, data.father_passport, 'FATHER', kindergartenId]
      );
      await run(
        'INSERT INTO parents (id, full_name, workplace, phone, passport_no, role, kindergarten_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [motherId, data.mother_full_name, data.mother_workplace, data.mother_phone || null, data.mother_passport, 'MOTHER', kindergartenId]
      );
      await run(
        'INSERT INTO parent_accounts (id, login, password_hash, kindergarten_id) VALUES (?, ?, ?, ?)',
        [accountId, finalLogin, passwordHash, kindergartenId]
      );
      await run(`
        INSERT INTO children
        (id, first_name, last_name, birth_date, age_category, gender, address, weight, height, allergies, passport_info, birth_certificate_number, medical_notes, status, father_id, mother_id, parent_account_id, group_id, kindergarten_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        childId, data.first_name, data.last_name, data.birth_date, data.age_category, data.gender,
        data.address, nullableNumber(data.weight), nullableNumber(data.height), data.allergies,
        data.passport_info, data.birth_certificate_number, data.medical_notes, data.status || 'PENDING', fatherId, motherId, accountId, groupId, kindergartenId
      ]);
      await OperationsRepository.log('CREATE', 'CHILD', `${data.first_name} ${data.last_name}`, 'Yangi bola ruyxatga olindi', 'OTHER', kindergartenId);
      await run('COMMIT');
      return { id: childId, login: finalLogin, password };
    } catch (error) {
      if (transactionStarted) await run('ROLLBACK').catch(() => undefined);
      throw error;
    }
  }

  async update(id: string, data: any, kindergartenId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmtChild = db.prepare(`
          UPDATE children SET 
            first_name = ?, last_name = ?, birth_date = ?, age_category = ?, gender = ?, 
            address = ?, weight = ?, height = ?, allergies = ?,
            passport_info = ?, birth_certificate_number = ?, medical_notes = ?, status = ?, group_id = ?
          WHERE id = ? AND kindergarten_id = ?
        `);
        const groupId = data.group_id && data.group_id !== '' ? data.group_id : null;
        stmtChild.run([
          data.first_name, data.last_name, data.birth_date, data.age_category, data.gender,
          data.address, nullableNumber(data.weight), nullableNumber(data.height), data.allergies,
          data.passport_info, data.birth_certificate_number, data.medical_notes, data.status, groupId, id, kindergartenId
        ]);
        stmtChild.finalize();

        db.get('SELECT father_id, mother_id, parent_account_id FROM children WHERE id = ? AND kindergarten_id = ?', [id, kindergartenId], async (err, child: any) => {
          if (err || !child) { db.run('ROLLBACK'); return reject(err || new Error('Child not found')); }

          try {
            const run = (sql: string, params: any[] = []) => new Promise<void>((res, rej) => {
              db.run(sql, params, (err) => err ? rej(err) : res());
            });

            await run('UPDATE parents SET full_name = ?, workplace = ?, phone = ?, passport_no = ? WHERE id = ? AND kindergarten_id = ?', [
              data.father_full_name, data.father_workplace, data.father_phone, data.father_passport, child.father_id, kindergartenId
            ]);
            await run('UPDATE parents SET full_name = ?, workplace = ?, phone = ?, passport_no = ? WHERE id = ? AND kindergarten_id = ?', [
              data.mother_full_name, data.mother_workplace, data.mother_phone, data.mother_passport, child.mother_id, kindergartenId
            ]);

            if (data.parent_login && child.parent_account_id) {
               const nextLogin = await assertLoginAvailable(db, data.parent_login, { excludeParentAccountId: child.parent_account_id });
               await run('UPDATE parent_accounts SET login = ? WHERE id = ? AND kindergarten_id = ?', [normalizeLogin(nextLogin), child.parent_account_id, kindergartenId]);
            }

            await OperationsRepository.log('UPDATE', 'CHILD', `${data.first_name} ${data.last_name}`, 'Bolaning ma\'lumotlari tahrirlandi');
            db.run('COMMIT', (err) => { if (err) { db.run('ROLLBACK'); reject(err); } else resolve(); });
          } catch (error) { db.run('ROLLBACK'); reject(error); }
        });
      });
    });
  }

  async delete(id: string, kindergartenId: string): Promise<void> {
    const get = (sql: string, params: any[] = []) => new Promise<any>((res, rej) => {
      db.get(sql, params, (err, row) => err ? rej(err) : res(row));
    });
    const run = (sql: string, params: any[] = []) => new Promise<void>((res, rej) => {
      db.run(sql, params, (err) => err ? rej(err) : res());
    });

    const child = await get(
      'SELECT first_name, last_name, father_id, mother_id, parent_account_id FROM children WHERE id = ? AND kindergarten_id = ?',
      [id, kindergartenId]
    );
    if (!child) throw new Error('Child not found');

    const name = `${child.first_name} ${child.last_name}`;
    let transactionStarted = false;
    try {
      await run('BEGIN TRANSACTION');
      transactionStarted = true;
      await run('DELETE FROM attendance WHERE child_id = ? AND kindergarten_id = ?', [id, kindergartenId]);
      await run('DELETE FROM health_checks WHERE child_id = ? AND kindergarten_id = ?', [id, kindergartenId]);
      await run('DELETE FROM parent_documents WHERE child_id = ? AND kindergarten_id = ?', [id, kindergartenId]);
      await run('DELETE FROM pickup_people WHERE child_id = ? AND kindergarten_id = ?', [id, kindergartenId]);
      await run('DELETE FROM children WHERE id = ? AND kindergarten_id = ?', [id, kindergartenId]);

      if (child.father_id) {
        await run('DELETE FROM parents WHERE id = ? AND kindergarten_id = ?', [child.father_id, kindergartenId]);
      }
      if (child.mother_id) {
        await run('DELETE FROM parents WHERE id = ? AND kindergarten_id = ?', [child.mother_id, kindergartenId]);
      }
      if (child.parent_account_id) {
        await run('DELETE FROM parent_accounts WHERE id = ? AND kindergarten_id = ?', [child.parent_account_id, kindergartenId]);
      }

      await OperationsRepository.log('DELETE', 'CHILD', name, 'Bolalar ruyxatidan o\'chirildi', 'OTHER', kindergartenId);
      await run('COMMIT');
    } catch (error) {
      if (transactionStarted) await run('ROLLBACK').catch(() => undefined);
      throw error;
    }
  }

  async findAll(kindergartenId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT c.*, 
               f.full_name as father_name, f.phone as father_phone, f.passport_no as father_passport, f.workplace as father_workplace,
               m.full_name as mother_name, m.phone as mother_phone, m.passport_no as mother_passport, m.workplace as mother_workplace,
               pa.login as parent_login,
               g.name as group_name,
               g.teacher_name as group_teacher
        FROM children c
        LEFT JOIN parents f ON c.father_id = f.id
        LEFT JOIN parents m ON c.mother_id = m.id
        LEFT JOIN parent_accounts pa ON c.parent_account_id = pa.id
        LEFT JOIN groups g ON c.group_id = g.id
        WHERE c.kindergarten_id = ?
        ORDER BY c.created_at DESC
      `, [kindergartenId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}
