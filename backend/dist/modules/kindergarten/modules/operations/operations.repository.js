import { db } from '../../db.js';
import crypto from 'crypto';
export class OperationsRepository {
    static async log(type, entity, name, description, category = 'OTHER', kindergartenId) {
        return new Promise((resolve, reject) => {
            const id = crypto.randomUUID();
            db.run('INSERT INTO operations_log (id, operation_type, entity_type, entity_name, description, category, kindergarten_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, type, entity, name, description, category, kindergartenId], (err) => {
                if (err) {
                    console.error('Logging error:', err);
                    resolve();
                }
                else {
                    resolve();
                }
            });
        });
    }
    async findAll(kindergartenId, limit = 10, includeArchived = false) {
        return new Promise((resolve, reject) => {
            const query = includeArchived
                ? 'SELECT * FROM operations_log WHERE kindergarten_id = ? ORDER BY created_at DESC LIMIT ?'
                : 'SELECT * FROM operations_log WHERE kindergarten_id = ? AND is_archived = 0 ORDER BY created_at DESC LIMIT ?';
            db.all(query, [kindergartenId, limit], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
    async findByCategory(kindergartenId, category, limit = 20) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM operations_log WHERE kindergarten_id = ? AND category = ? AND is_archived = 0 ORDER BY created_at DESC LIMIT ?', [kindergartenId, category, limit], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
    async archive(id, kindergartenId) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE operations_log SET is_archived = 1 WHERE id = ? AND kindergarten_id = ?', [id, kindergartenId], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async findArchived(kindergartenId, limit = 50) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM operations_log WHERE kindergarten_id = ? AND is_archived = 1 ORDER BY created_at DESC LIMIT ?', [kindergartenId, limit], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
    async findRecent(kindergartenId, days) {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM operations_log WHERE kindergarten_id = ? AND created_at >= datetime('now', '-' || ? || ' days') AND is_archived = 0 ORDER BY created_at DESC", [kindergartenId, days], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
}
