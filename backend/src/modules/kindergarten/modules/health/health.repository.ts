import { db } from '../../db.js';
import crypto from 'crypto';
import { OperationsRepository } from '../operations/operations.repository.js';

const HEALTH_METRIC_STATUSES = ['NORMAL', 'WATCH', 'NOT_CHECKED'];

const normalizeStatus = (value: any, measuredValue: any) => {
  const status = String(value || '').toUpperCase();
  if (HEALTH_METRIC_STATUSES.includes(status)) return status;
  return measuredValue === '' || measuredValue == null ? 'NOT_CHECKED' : 'NORMAL';
};

export class HealthRepository {
  async saveCheck(data: any, kindergartenId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const dbDate = new Date().toISOString().split('T')[0];

      db.run(`
        INSERT INTO health_checks (
          id, kindergarten_id, child_id, date, weight, height, temperature, chest_circumference,
          weight_status, height_status, temperature_status, chest_circumference_status,
          allergy, is_sick, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        kindergartenId || data.kindergarten_id || null,
        data.child_id,
        dbDate,
        data.weight,
        data.height,
        data.temperature,
        data.chest_circumference,
        normalizeStatus(data.weight_status, data.weight),
        normalizeStatus(data.height_status, data.height),
        normalizeStatus(data.temperature_status, data.temperature),
        normalizeStatus(data.chest_circumference_status, data.chest_circumference),
        data.allergy,
        data.is_sick ? 1 : 0,
        data.notes
      ], async (err) => {
        if (err) reject(err);
        else {
          // Also update children table for current status
          db.run(`
            UPDATE children SET weight = ?, height = ?, allergies = ?, medical_notes = ?, is_allergic = ?, status = CASE WHEN ? = 1 THEN 'SICK' ELSE 'ACTIVE' END
            WHERE id = ?
          `, [data.weight, data.height, data.allergy, data.notes, data.is_allergic ? 1 : 0, data.is_sick ? 1 : 0, data.child_id]);
          
          resolve();
        }
      });
    });
  }

  async getHistoryByGroup(groupId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT hc.*, c.first_name || ' ' || c.last_name as child_name
        FROM health_checks hc
        JOIN children c ON hc.child_id = c.id
        WHERE c.group_id = ?
        ORDER BY hc.date DESC, hc.created_at DESC
      `, [groupId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getArchiveSummary(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          hc.date, 
          g.name as group_name,
          COUNT(hc.id) as total_measured,
          SUM(CASE WHEN hc.is_sick = 1 THEN 1 ELSE 0 END) as sick_count
        FROM health_checks hc
        JOIN children c ON hc.child_id = c.id
        JOIN groups g ON c.group_id = g.id
        GROUP BY hc.date, g.id
        ORDER BY hc.date DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}
