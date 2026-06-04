import { Router } from 'express';
import crypto from 'crypto';
import { resolveKindergartenId } from '../requestContext.js';
import { all, get, run, ensureTables, parseJson, } from './routeSupport.js';
export const chefRoutes = Router();
const getSanitaryPeriod = (value = new Date()) => {
    const start = new Date(value);
    const startHour = Math.floor(start.getHours() / 6) * 6;
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 6, 0, 0, 0);
    const pad = (num) => String(num).padStart(2, '0');
    const label = `${pad(start.getHours())}:00-${pad(end.getHours() % 24)}:00`;
    return {
        start: start.toISOString(),
        end: end.toISOString(),
        label,
    };
};
const decorateSanitaryCheckpoint = (row) => ({
    ...row,
    passed: Boolean(row.passed),
    nurse_approved: Boolean(row.nurse_approved),
    approved: row.status === 'APPROVED' || Boolean(row.nurse_approved),
    pending_nurse: row.status === 'PENDING_NURSE' && !row.nurse_approved,
    period_label: row.period_label || getSanitaryPeriod(row.period_start ? new Date(row.period_start) : new Date()).label,
    answers: parseJson(row.answers, {}),
});
chefRoutes.get("/chef/sanitary-check/current", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const chefId = String(req.query.chef_id || req.query.chefId || '');
        const date = String(req.query.date || new Date().toISOString().slice(0, 10));
        const period = getSanitaryPeriod();
        const row = await get(`
      SELECT *
      FROM chef_sanitary_checks
      WHERE kindergarten_id = ?
        AND chef_id = ?
        AND date = ?
        AND (period_start = ? OR period_start IS NULL)
      ORDER BY submitted_at DESC, created_at DESC
      LIMIT 1
    `, [kindergartenId, chefId, date, period.start]);
        if (!row) {
            return res.json({
                approved: false,
                pending_nurse: false,
                period_start: period.start,
                period_end: period.end,
                period_label: period.label,
            });
        }
        return res.json(decorateSanitaryCheckpoint({
            ...row,
            period_label: row.period_start ? getSanitaryPeriod(new Date(row.period_start)).label : period.label,
        }));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
chefRoutes.get("/chef/sanitary-check/status/:chefId/:date", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const row = await get('SELECT passed FROM chef_sanitary_checks WHERE kindergarten_id = ? AND chef_id = ? AND date = ?', [
            kindergartenId,
            req.params.chefId,
            req.params.date,
        ]);
        res.json({ passed: Boolean(row?.passed) });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
chefRoutes.post("/chef/sanitary-check", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const chefId = String(req.body.chef_id || req.body.chefId || req.body.user_id || req.body.userId || '');
        const date = req.body.date || new Date().toISOString().slice(0, 10);
        const period = getSanitaryPeriod(req.body.submitted_at ? new Date(req.body.submitted_at) : new Date());
        const submittedAt = req.body.submitted_at || new Date().toISOString();
        const checkpointId = crypto.randomUUID();
        await run(`
      INSERT OR REPLACE INTO chef_sanitary_checks
        (id, kindergarten_id, chef_id, date, passed, period_start, period_end, status, submitted_at, nurse_approved, answers)
      VALUES (
        COALESCE((SELECT id FROM chef_sanitary_checks WHERE kindergarten_id = ? AND chef_id = ? AND date = ? AND period_start = ?), ?),
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [
            kindergartenId,
            chefId,
            date,
            period.start,
            checkpointId,
            kindergartenId,
            chefId,
            date,
            1,
            period.start,
            period.end,
            'PENDING_NURSE',
            submittedAt,
            0,
            JSON.stringify(req.body.answers || req.body),
        ]);
        res.status(201).json({
            success: true,
            passed: true,
            pending_nurse: true,
            period_start: period.start,
            period_end: period.end,
            period_label: period.label,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
chefRoutes.get("/nurse/sanitary-checkpoints", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const date = String(req.query.date || new Date().toISOString().slice(0, 10));
        const rows = await all(`
      SELECT c.*, COALESCE(s.full_name, r.full_name, 'Oshpaz') AS chef_name
      FROM chef_sanitary_checks c
      LEFT JOIN staff s ON s.id = c.chef_id AND s.kindergarten_id = c.kindergarten_id
      LEFT JOIN role_accounts r ON r.id = c.chef_id AND r.kindergarten_id = c.kindergarten_id
      WHERE c.kindergarten_id = ? AND c.date = ?
      ORDER BY c.submitted_at DESC, c.created_at DESC
    `, [kindergartenId, date]);
        res.json(rows.map((row) => decorateSanitaryCheckpoint({
            ...row,
            period_label: row.period_start ? getSanitaryPeriod(new Date(row.period_start)).label : undefined,
        })));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
chefRoutes.post("/nurse/sanitary-checkpoints/:id/approve", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const result = await run(`
      UPDATE chef_sanitary_checks
      SET status = 'APPROVED',
          nurse_approved = 1,
          nurse_approved_at = ?,
          nurse_id = ?,
          nurse_notes = ?
      WHERE id = ? AND kindergarten_id = ?
    `, [
            new Date().toISOString(),
            req.body.nurse_id || null,
            req.body.nurse_notes || null,
            req.params.id,
            kindergartenId,
        ]);
        if (!result.changes)
            return res.status(404).json({ error: 'Checkpoint topilmadi' });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
chefRoutes.get("/nurse/today-meals", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const date = String(req.query.date || new Date().toISOString().slice(0, 10));
        const rows = await all(`
      SELECT kt.*, m.meal_name, m.meal_type, m.age_group, m.diet_type, m.calories, m.vitamins, m.composition, m.products, m.protein, m.fat, m.iron, m.carbohydrates, m.image_url
      FROM kitchen_tasks kt
      JOIN menus m ON m.id = kt.menu_id
      WHERE kt.kindergarten_id = ? AND m.date = ?
      ORDER BY m.meal_type
    `, [kindergartenId, date]);
        res.json(rows.map((row) => ({
            id: row.menu_id || row.id,
            task_id: row.id,
            taskId: row.id,
            menu_id: row.menu_id,
            meal_name: row.meal_name,
            mealName: row.meal_name,
            meal_type: row.meal_type,
            mealType: row.meal_type,
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
            kitchen_status: row.status || 'BOSHLASH',
            status: row.status || 'BOSHLASH',
            nurse_quality_status: row.nurse_quality_status || 'PENDING',
            nurse_quality_comment: row.nurse_quality_comment || '',
            nurse_quality_checked_at: row.nurse_quality_checked_at,
            nurse_quality_checked_by: row.nurse_quality_checked_by,
        })));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
chefRoutes.post("/nurse/meal-quality/:taskId", async (req, res) => {
    try {
        await ensureTables();
        const kindergartenId = await resolveKindergartenId(req);
        const status = String(req.body.quality_status || '').toUpperCase();
        if (!['QUALITY_OK', 'QUALITY_BAD'].includes(status)) {
            return res.status(400).json({ error: "Organoleptik holat noto'g'ri" });
        }
        const result = await run(`
      UPDATE kitchen_tasks
      SET nurse_quality_status = ?,
          nurse_quality_comment = ?,
          nurse_quality_checked_at = ?,
          nurse_quality_checked_by = ?
      WHERE id = ? AND kindergarten_id = ?
    `, [
            status,
            req.body.comment || null,
            new Date().toISOString(),
            req.body.nurse_id || null,
            req.params.taskId,
            kindergartenId,
        ]);
        if (!result.changes)
            return res.status(404).json({ error: 'Taom vazifasi topilmadi' });
        res.json({ success: true, quality_status: status });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
