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

export const foodRoutes = Router();

foodRoutes.get("/dishes", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all('SELECT * FROM dishes WHERE kindergarten_id = ? ORDER BY name', [kindergartenId]);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.post("/dishes", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const id = crypto.randomUUID();
    await run(`
      INSERT INTO dishes (id, kindergarten_id, name, image, kcal, iron, carbs, vitamins)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      kindergartenId,
      req.body.name,
      req.body.image || null,
      Number(req.body.kcal || 0),
      Number(req.body.iron || 0),
      Number(req.body.carbs || 0),
      req.body.vitamins || null,
    ]);
    res.status(201).json({ id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.delete("/dishes/:id", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    await run('DELETE FROM dishes WHERE id = ? AND kindergarten_id = ?', [req.params.id, kindergartenId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.get("/menu/:date", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all('SELECT * FROM menus WHERE kindergarten_id = ? AND date = ? ORDER BY meal_type, age_group, diet_type', [kindergartenId, req.params.date]);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.post("/menu", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const id = crypto.randomUUID();
    const nutrition = req.body.nutrition || {};
    await run(`
      INSERT INTO menus (id, kindergarten_id, date, meal_name, meal_type, age_group, diet_type, iron, carbohydrates, vitamins, composition, products, protein, fat, calories, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      kindergartenId,
      req.body.date,
      req.body.meal_name,
      req.body.meal_type,
      req.body.age_group || null,
      req.body.diet_type || 'REGULAR',
      Number(nutrition.iron || req.body.iron || 0),
      Number(nutrition.carbs || nutrition.carbohydrates || req.body.carbohydrates || 0),
      nutrition.vitamins || req.body.vitamins || null,
      req.body.composition || null,
      req.body.products || null,
      Number(nutrition.protein || req.body.protein || 0),
      Number(nutrition.fat || req.body.fat || 0),
      Number(nutrition.kcal || nutrition.calories || req.body.calories || 0),
      req.body.image_url || null,
    ]);
    await run('INSERT INTO kitchen_tasks (id, kindergarten_id, menu_id, status) VALUES (?, ?, ?, ?)', [
      crypto.randomUUID(),
      kindergartenId,
      id,
      'BOSHLASH',
    ]);
    res.status(201).json({ id, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.post("/menus/approve-today", async (req, res) => {
  try {
    const kindergartenId = await resolveKindergartenId(req);
    const today = new Date().toISOString().slice(0, 10);
    await run('UPDATE menus SET is_approved = 1 WHERE kindergarten_id = ? AND date = ?', [kindergartenId, today]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.get("/kitchen/tasks/:date", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all<any>(`
      SELECT kt.*, m.meal_name, m.meal_type, m.age_group, m.diet_type, m.calories, m.vitamins, m.composition, m.products, m.protein, m.fat, m.iron, m.carbohydrates, m.image_url
      FROM kitchen_tasks kt
      JOIN menus m ON m.id = kt.menu_id
      WHERE kt.kindergarten_id = ? AND m.date = ?
      ORDER BY m.meal_type
    `, [kindergartenId, req.params.date]);

    res.json(rows.map((row) => ({
      id: row.menu_id || row.id,
      taskId: row.id,
      menu_id: row.menu_id,
      task_id: row.id,
      meal_name: row.meal_name,
      meal_type: row.meal_type,
      age_group: row.age_group,
      diet_type: row.diet_type,
      calories: Number(row.calories || 0),
      vitamins: row.vitamins,
      composition: row.composition,
      products: row.products,
      protein: Number(row.protein || 0),
      fat: Number(row.fat || 0),
      iron: Number(row.iron || 0),
      carbohydrates: Number(row.carbohydrates || 0),
      image_url: row.image_url,
      temperature: row.temperature,
      start_time: row.start_time,
      end_time: row.end_time,
      served_time: row.served_time,
      mealName: row.meal_name,
      mealType: row.meal_type,
      ageGroup: row.age_group,
      dietType: row.diet_type,
      portions: row.age_group === '1-3' ? 45 : 82,
      dietPortions: row.diet_type === 'DIETARY' ? 12 : 0,
      originalPortions: row.age_group === '1-3' ? 45 : 82,
      status: row.status || 'BOSHLASH',
      startTime: row.start_time,
      completedAt: row.end_time,
      ingredients: [],
      alerts: [],
      temperatureRecords: row.temperature ? [{ time: row.end_time || row.start_time || '', temp: row.temperature }] : [],
      hygieneChecks: []
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.post("/kitchen/tasks/:menuId/status", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const existing = await get<any>('SELECT id FROM kitchen_tasks WHERE kindergarten_id = ? AND menu_id = ?', [kindergartenId, req.params.menuId]);
    if (existing) {
      await run(`
        UPDATE kitchen_tasks
        SET status = COALESCE(?, status),
            temperature = COALESCE(?, temperature),
            start_time = COALESCE(?, start_time),
            end_time = COALESCE(?, end_time),
            served_time = COALESCE(?, served_time)
        WHERE id = ? AND kindergarten_id = ?
      `, [req.body.status || null, req.body.temperature ?? null, req.body.start_time || null, req.body.end_time || null, req.body.served_time || null, existing.id, kindergartenId]);
    } else {
      await run('INSERT INTO kitchen_tasks (id, kindergarten_id, menu_id, status, temperature) VALUES (?, ?, ?, ?, ?)', [
        crypto.randomUUID(),
        kindergartenId,
        req.params.menuId,
        req.body.status || 'BOSHLASH',
        req.body.temperature ?? null,
      ]);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.get("/lab/samples", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const rows = await all<any>('SELECT * FROM lab_samples WHERE kindergarten_id = ? ORDER BY timestamp DESC', [kindergartenId]);
    res.json(rows.map((row) => ({
      ...row,
      nutrition: parseJson(row.nutrition, {}),
      test_results: parseJson(row.test_results, null),
      storage_temp_history: parseJson(row.storage_temp_history, []),
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

foodRoutes.post("/lab/samples", async (req, res) => {
  try {
    await ensureTables();
    const kindergartenId = await resolveKindergartenId(req);
    const sampleId = req.body.sample_id || crypto.randomUUID();
    await run(`
      INSERT OR REPLACE INTO lab_samples
        (sample_id, kindergarten_id, dish_id, dish_name, batch_reference, date, storage_location, storage_duration, status, lab_result, risk_level, notes, created_by, timestamp, nutrition, test_results, storage_temp_history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sampleId,
      kindergartenId,
      req.body.dish_id || null,
      req.body.dish_name || null,
      req.body.batch_reference || null,
      req.body.date || new Date().toISOString().slice(0, 10),
      req.body.storage_location || null,
      Number(req.body.storage_duration || 24),
      req.body.status || 'COLLECTED',
      req.body.lab_result || null,
      req.body.risk_level || 'NORMAL',
      req.body.notes || null,
      req.body.created_by || null,
      req.body.timestamp || new Date().toISOString(),
      JSON.stringify(req.body.nutrition || {}),
      JSON.stringify(req.body.test_results || null),
      JSON.stringify(req.body.storage_temp_history || []),
    ]);
    res.status(201).json({ sample_id: sampleId, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
