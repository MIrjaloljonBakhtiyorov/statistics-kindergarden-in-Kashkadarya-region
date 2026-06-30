import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { resolveKindergartenId } from '../requestContext.js';
import { assertLoginAvailable } from '../../shared/loginUniqueness.js';
import {
  all,
  get,
  run,
  ensureTables,
  parseJson,
  toPositiveNumber,
  normalizeIsoDate,
  isHealthCheckDue,
  normalizeArchiveMonths,
  getArchiveCutoffDate,
  getKindergartenChildCount,
  ensureMedicalInventoryDefaults,
  getMedicalItemStock,
  decorateMedicalItems,
  logOperation,
  resolveMedicalOutDetails,
  resolveChatUserId,
} from './routeSupport.js';

export const medicalInventoryRoutes = Router();

medicalInventoryRoutes.get("/medical-inventory/items", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    await ensureMedicalInventoryDefaults(kindergartenId);
    const childCount = await getKindergartenChildCount(kindergartenId);
    const rows = await all<any>(`
      SELECT
        i.*,
        COALESCE(SUM(CASE WHEN m.type = 'IN' THEN m.quantity WHEN m.type = 'OUT' THEN -m.quantity ELSE 0 END), 0) as current_quantity,
        COUNT(m.id) as movement_count,
        MIN(CASE WHEN m.type = 'IN' AND m.expiry_date IS NOT NULL AND m.expiry_date >= ? THEN m.expiry_date END) as nearest_expiry_date,
        MIN(CASE WHEN m.type = 'IN' AND m.expiry_date IS NOT NULL THEN m.expiry_date END) as first_expiry_date
      FROM medical_inventory_items i
      LEFT JOIN medical_inventory_movements m ON m.item_id = i.id AND m.kindergarten_id = i.kindergarten_id
      WHERE i.kindergarten_id = ?
      GROUP BY i.id, i.kindergarten_id, i.name, i.form, i.unit, i.required_per_100, i.required_label, i.is_default, i.created_at, i.updated_at
      ORDER BY i.is_default DESC, i.name
    `, [new Date().toISOString().slice(0, 10), kindergartenId]);
    res.json(decorateMedicalItems(rows, childCount));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

medicalInventoryRoutes.post("/medical-inventory/items", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Dori nomi kiritilishi shart' });

    const id = crypto.randomUUID();
    await run(
      `INSERT INTO medical_inventory_items
        (id, kindergarten_id, name, form, unit, required_per_100, required_label, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        kindergartenId,
        name,
        req.body.form || null,
        req.body.unit || 'dona',
        Number(req.body.required_per_100 || 0),
        req.body.required_label || null,
        0,
      ]
    );
    await logOperation(kindergartenId, 'CREATE', 'medical_inventory', name, `${name} dorixonaga qo'shildi`, 'HEALTH');
    res.status(201).json({ id, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

medicalInventoryRoutes.put("/medical-inventory/items/:id", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Dori nomi kiritilishi shart' });

    await run(`
      UPDATE medical_inventory_items
      SET name = ?, form = ?, unit = ?, required_per_100 = ?, required_label = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND kindergarten_id = ?
    `, [
      name,
      req.body.form || null,
      req.body.unit || 'dona',
      Number(req.body.required_per_100 || 0),
      req.body.required_label || null,
      req.params.id,
      kindergartenId,
    ]);
    await logOperation(kindergartenId, 'UPDATE', 'medical_inventory', name, `${name} dorixona ma'lumoti yangilandi`, 'HEALTH');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

medicalInventoryRoutes.get("/medical-inventory/movements", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all<any>(`
      SELECT
        m.*,
        i.name as item_name,
        i.unit,
        g.name as group_name,
        CASE
          WHEN c.id IS NULL THEN NULL
          ELSE c.first_name || ' ' || c.last_name
        END as child_name
      FROM medical_inventory_movements m
      LEFT JOIN medical_inventory_items i ON i.id = m.item_id
      LEFT JOIN groups g ON g.id = m.group_id
      LEFT JOIN children c ON c.id = m.child_id
      WHERE m.kindergarten_id = ?
      ORDER BY m.movement_date DESC, m.created_at DESC
    `, [kindergartenId]);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

medicalInventoryRoutes.get("/medical-inventory/archive", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const months = normalizeArchiveMonths(req.query.months);
    const cutoffDate = getArchiveCutoffDate(months);

    const movements = await all<any>(`
      SELECT
        m.*,
        i.name as item_name,
        i.unit,
        i.form,
        g.name as group_name,
        CASE
          WHEN c.id IS NULL THEN NULL
          ELSE c.first_name || ' ' || c.last_name
        END as child_name
      FROM medical_inventory_movements m
      LEFT JOIN medical_inventory_items i ON i.id = m.item_id
      LEFT JOIN groups g ON g.id = m.group_id
      LEFT JOIN children c ON c.id = m.child_id
      WHERE m.kindergarten_id = ? AND m.movement_date >= ?
      ORDER BY m.movement_date DESC, m.created_at DESC
    `, [kindergartenId, cutoffDate]);

    const summary = await all<any>(`
      SELECT
        i.id as item_id,
        i.name as item_name,
        i.unit,
        COUNT(m.id) as entries,
        COALESCE(SUM(CASE WHEN m.type = 'IN' THEN m.quantity ELSE 0 END), 0) as in_quantity,
        COALESCE(SUM(CASE WHEN m.type = 'OUT' THEN m.quantity ELSE 0 END), 0) as out_quantity,
        COALESCE(SUM(CASE WHEN m.type = 'IN' THEN m.quantity WHEN m.type = 'OUT' THEN -m.quantity ELSE 0 END), 0) as net_quantity
      FROM medical_inventory_movements m
      LEFT JOIN medical_inventory_items i ON i.id = m.item_id
      WHERE m.kindergarten_id = ? AND m.movement_date >= ?
      GROUP BY i.id, i.name, i.unit
      ORDER BY i.name
    `, [kindergartenId, cutoffDate]);

    const totals = summary.reduce((acc, row) => ({
      entries: acc.entries + Number(row.entries || 0),
      in_quantity: acc.in_quantity + Number(row.in_quantity || 0),
      out_quantity: acc.out_quantity + Number(row.out_quantity || 0),
      net_quantity: acc.net_quantity + Number(row.net_quantity || 0),
    }), { entries: 0, in_quantity: 0, out_quantity: 0, net_quantity: 0 });

    res.json({
      months,
      cutoff_date: cutoffDate,
      generated_at: new Date().toISOString(),
      totals,
      summary: summary.map((row) => ({
        ...row,
        entries: Number(row.entries || 0),
        in_quantity: Number(row.in_quantity || 0),
        out_quantity: Number(row.out_quantity || 0),
        net_quantity: Number(row.net_quantity || 0),
      })),
      movements: movements.map((row) => ({
        ...row,
        quantity: Number(row.quantity || 0),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

medicalInventoryRoutes.post("/medical-inventory/movements", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const itemId = String(req.body.item_id || '').trim();
    const type = String(req.body.type || '').toUpperCase();
    const quantity = toPositiveNumber(req.body.quantity);
    if (!itemId || !['IN', 'OUT'].includes(type) || quantity <= 0) {
      return res.status(400).json({ error: 'Dori, amal turi va miqdor toвЂgвЂri kiritilishi shart' });
    }

    const item = await get<any>('SELECT * FROM medical_inventory_items WHERE id = ? AND kindergarten_id = ?', [itemId, kindergartenId]);
    if (!item) return res.status(404).json({ error: 'Dori topilmadi' });

    const currentStock = await getMedicalItemStock(kindergartenId, itemId);
    if (type === 'OUT' && quantity > currentStock) {
      return res.status(400).json({ error: 'Dorixonada bunday miqdor yoвЂq' });
    }

    const outDetails = type === 'OUT' ? await resolveMedicalOutDetails(kindergartenId, req.body) : null;
    const id = crypto.randomUUID();
    const movementDate = normalizeIsoDate(req.body.movement_date || req.body.received_date);
    await run(`
      INSERT INTO medical_inventory_movements
        (id, kindergarten_id, item_id, type, quantity, movement_date, expiry_date, batch_number, source, reason,
         group_id, child_id, usage_time, diagnosis, evidence_photo_url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      kindergartenId,
      itemId,
      type,
      quantity,
      movementDate,
      req.body.expiry_date ? normalizeIsoDate(req.body.expiry_date, '') : null,
      req.body.batch_number || null,
      req.body.source || null,
      req.body.reason || null,
      outDetails?.groupId || null,
      outDetails?.childId || null,
      outDetails?.usageTime || null,
      outDetails?.diagnosis || null,
      outDetails?.evidencePhotoUrl || null,
      req.body.notes || null,
    ]);
    const description = type === 'OUT' && outDetails
      ? `${item.name}: ${quantity} ${item.unit || ''} ${outDetails.childName} uchun ${outDetails.diagnosis} tashxisi bilan chiqim qilindi`
      : `${item.name}: ${quantity} ${item.unit || ''} kirim qilindi`;
    await logOperation(kindergartenId, type === 'IN' ? 'CREATE' : 'UPDATE', 'medical_inventory', item.name, description, 'HEALTH');
    res.status(201).json({ id, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

medicalInventoryRoutes.put("/medical-inventory/movements/:id", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const movement = await get<any>('SELECT * FROM medical_inventory_movements WHERE id = ? AND kindergarten_id = ?', [req.params.id, kindergartenId]);
    if (!movement) return res.status(404).json({ error: 'Kirim/chiqim yozuvi topilmadi' });

    const itemId = String(req.body.item_id || movement.item_id || '').trim();
    const type = String(req.body.type || movement.type || '').toUpperCase();
    const quantity = toPositiveNumber(req.body.quantity);
    if (!itemId || !['IN', 'OUT'].includes(type) || quantity <= 0) {
      return res.status(400).json({ error: 'Dori, amal turi va miqdor toвЂgвЂri kiritilishi shart' });
    }

    const item = await get<any>('SELECT * FROM medical_inventory_items WHERE id = ? AND kindergarten_id = ?', [itemId, kindergartenId]);
    if (!item) return res.status(404).json({ error: 'Dori topilmadi' });

    const stockWithoutCurrent = await getMedicalItemStock(kindergartenId, itemId, req.params.id);
    const nextDelta = type === 'IN' ? quantity : -quantity;
    if (stockWithoutCurrent + nextDelta < 0) {
      return res.status(400).json({ error: 'Tahrirdan keyin qoldiq manfiy boвЂlib qoladi' });
    }

    const outDetails = type === 'OUT' ? await resolveMedicalOutDetails(kindergartenId, req.body) : null;
    await run(`
      UPDATE medical_inventory_movements
      SET item_id = ?, type = ?, quantity = ?, movement_date = ?, expiry_date = ?, batch_number = ?,
          source = ?, reason = ?, group_id = ?, child_id = ?, usage_time = ?, diagnosis = ?,
          evidence_photo_url = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND kindergarten_id = ?
    `, [
      itemId,
      type,
      quantity,
      normalizeIsoDate(req.body.movement_date || req.body.received_date || movement.movement_date),
      req.body.expiry_date ? normalizeIsoDate(req.body.expiry_date, '') : null,
      req.body.batch_number || null,
      req.body.source || null,
      req.body.reason || null,
      outDetails?.groupId || null,
      outDetails?.childId || null,
      outDetails?.usageTime || null,
      outDetails?.diagnosis || null,
      outDetails?.evidencePhotoUrl || null,
      req.body.notes || null,
      req.params.id,
      kindergartenId,
    ]);
    await logOperation(kindergartenId, 'UPDATE', 'medical_inventory', item.name, `${item.name} kirim/chiqim yozuvi tahrirlandi`, 'HEALTH');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
