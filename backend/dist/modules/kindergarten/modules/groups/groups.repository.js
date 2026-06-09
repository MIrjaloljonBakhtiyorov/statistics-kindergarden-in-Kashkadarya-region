import { db } from '../../db.js';
import crypto from 'crypto';
import { OperationsRepository } from '../operations/operations.repository.js';
export class GroupsRepository {
    async findAll(kindergartenId) {
        return new Promise((resolve, reject) => {
            const params = kindergartenId ? [kindergartenId] : [];
            const query = kindergartenId ? "SELECT * FROM groups WHERE kindergarten_id = ?" : "SELECT * FROM groups";
            db.all(query, params, async (err, groups) => {
                if (err)
                    return reject(err);
                try {
                    const groupsWithChildren = await Promise.all(groups.map(async (group) => {
                        const children = await new Promise((res, rej) => {
                            db.all(`
                SELECT 
                  c.id, c.first_name, c.last_name, c.gender, c.status, c.parent_account_id,
                  f.full_name as father_name, m.full_name as mother_name
                FROM children c 
                LEFT JOIN parents f ON c.father_id = f.id
                LEFT JOIN parents m ON c.mother_id = m.id
                WHERE c.group_id = ? AND c.kindergarten_id = ?
              `, [group.id, group.kindergarten_id], (err, rows) => {
                                if (err)
                                    rej(err);
                                else
                                    res(rows);
                            });
                        });
                        return { ...group, children };
                    }));
                    resolve(groupsWithChildren);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async findById(id) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM groups WHERE id = ?", [id], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    async create(data, kindergartenId) {
        const id = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO groups (id, kindergarten_id, name, teacher_name, age_category, capacity, age_limit) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, kindergartenId || data.kindergarten_id || null, data.name, data.teacher_name, data.age_category || data.age_limit, data.capacity, data.age_limit], async function (err) {
                if (err)
                    reject(err);
                else {
                    await OperationsRepository.log('CREATE', 'GROUP', data.name, 'Yangi guruh yaratildi');
                    resolve({ id, ...data });
                }
            });
        });
    }
    async update(id, data, kindergartenId) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE groups SET name = ?, teacher_name = ?, age_category = ?, capacity = ?, age_limit = ? WHERE id = ?${kindergartenId ? ' AND kindergarten_id = ?' : ''}`, kindergartenId
                ? [data.name, data.teacher_name, data.age_category || data.age_limit, data.capacity, data.age_limit, id, kindergartenId]
                : [data.name, data.teacher_name, data.age_category || data.age_limit, data.capacity, data.age_limit, id], async function (err) {
                if (err)
                    reject(err);
                else {
                    await OperationsRepository.log('UPDATE', 'GROUP', data.name, 'Guruh ma\'lumotlari tahrirlandi');
                    resolve({ id, ...data });
                }
            });
        });
    }
    async delete(id, kindergartenId) {
        return new Promise((resolve, reject) => {
            db.get("SELECT name FROM groups WHERE id = ? AND kindergarten_id = ?", [id, kindergartenId], (err, group) => {
                if (err)
                    return reject(err);
                if (!group)
                    return resolve();
                db.get(`SELECT
             (SELECT COUNT(*) FROM children WHERE group_id = ? AND kindergarten_id = ?) as children_count,
             (SELECT COUNT(*) FROM staff WHERE group_id = ? AND kindergarten_id = ?) as staff_count`, [id, kindergartenId, id, kindergartenId], (countErr, counts) => {
                    if (countErr)
                        return reject(countErr);
                    if (Number(counts?.children_count || 0) > 0) {
                        return reject(new Error('Guruhda bolalar borligi sababli uni o\'chirib bo\'lmaydi'));
                    }
                    db.run("DELETE FROM daily_meal_portions WHERE group_id = ? AND kindergarten_id = ?", [id, kindergartenId], (portionErr) => {
                        if (portionErr)
                            return reject(portionErr);
                        db.run("UPDATE staff SET group_id = NULL WHERE group_id = ? AND kindergarten_id = ?", [id, kindergartenId], (staffErr) => {
                            if (staffErr)
                                return reject(staffErr);
                            db.run("DELETE FROM groups WHERE id = ? AND kindergarten_id = ?", [id, kindergartenId], async (deleteErr) => {
                                if (deleteErr)
                                    return reject(deleteErr);
                                await OperationsRepository.log('DELETE', 'GROUP', group.name, 'Guruh o\'chirib tashlandi');
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    }
}
