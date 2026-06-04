import { Router } from 'express';
import { resolveKindergartenId } from '../requestContext.js';
import { get, run, } from './routeSupport.js';
export const settingsRoutes = Router();
settingsRoutes.get("/settings", async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        const settings = await get('SELECT kg_name, kg_logo FROM kindergarten_settings WHERE kindergarten_id = ?', [kindergartenId]);
        res.json(settings || {});
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
settingsRoutes.post("/settings", async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        const current = await get('SELECT kindergarten_id FROM kindergarten_settings WHERE kindergarten_id = ?', [kindergartenId]);
        if (current) {
            await run(`
        UPDATE kindergarten_settings
        SET kg_name = COALESCE(?, kg_name),
            kg_logo = COALESCE(?, kg_logo),
            updated_at = CURRENT_TIMESTAMP
        WHERE kindergarten_id = ?
      `, [req.body.kg_name || null, req.body.kg_logo || null, kindergartenId]);
        }
        else {
            await run('INSERT INTO kindergarten_settings (kindergarten_id, kg_name, kg_logo) VALUES (?, ?, ?)', [
                kindergartenId,
                req.body.kg_name || null,
                req.body.kg_logo || null,
            ]);
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const roleLabels = {
    OPERATOR: 'Operator',
    TEACHER: 'Tarbiyachi',
    NURSE: 'Hamshira',
    CHEF: 'Oshpaz',
    STOREKEEPER: 'Omborchi',
    INSPECTOR: 'Nazorat / Laboratoriya',
};
