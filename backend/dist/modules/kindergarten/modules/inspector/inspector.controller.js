import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../../db.js';
import { resolveKindergartenId } from '../../requestContext.js';
export class InspectorController {
    router = Router();
    constructor() {
        this.router.get('/', this.getAll);
        this.router.post('/', this.create);
        this.router.patch('/:id', this.update);
        this.router.post('/:id/submit', this.submit);
    }
    getAll = async (req, res) => {
        try {
            const kindergartenId = await resolveKindergartenId(req);
            db.all('SELECT * FROM audits WHERE kindergarten_id = ? ORDER BY created_at DESC', [kindergartenId], (err, rows) => {
                if (err)
                    return res.status(500).json({ error: err.message });
                res.json(rows);
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    create = async (req, res) => {
        try {
            const kindergartenId = await resolveKindergartenId(req);
            const id = crypto.randomUUID();
            const data = req.body;
            db.run(`
        INSERT INTO audits (id, kindergarten_id, inspection_id, inspection_type, overall_result, severity, notes, created_by, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                id,
                kindergartenId,
                data.inspection_id || null,
                data.inspection_type || 'GENERAL',
                data.overall_result || 'DRAFT',
                data.severity || null,
                data.notes || null,
                data.created_by || null,
                data.status || 'DRAFT',
            ], (err) => {
                if (err)
                    return res.status(500).json({ error: err.message });
                res.status(201).json({ id, ...data, kindergarten_id: kindergartenId, status: data.status || 'DRAFT' });
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    update = async (req, res) => {
        try {
            const kindergartenId = await resolveKindergartenId(req);
            const data = req.body;
            db.run(`
        UPDATE audits
        SET inspection_type = COALESCE(?, inspection_type),
            overall_result = COALESCE(?, overall_result),
            severity = COALESCE(?, severity),
            notes = COALESCE(?, notes),
            status = COALESCE(?, status)
        WHERE id = ? AND kindergarten_id = ?
      `, [
                data.inspection_type || data.type || null,
                data.overall_result || null,
                data.severity || null,
                data.notes || null,
                data.status || null,
                req.params.id,
                kindergartenId,
            ], function (err) {
                if (err)
                    return res.status(500).json({ error: err.message });
                if (this.changes === 0)
                    return res.status(404).json({ error: 'Inspection not found' });
                res.json({ id: req.params.id, ...data, kindergarten_id: kindergartenId });
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    submit = async (req, res) => {
        try {
            const kindergartenId = await resolveKindergartenId(req);
            db.run(`UPDATE audits SET status = 'COMPLETED', overall_result = COALESCE(overall_result, 'COMPLETED') WHERE id = ? AND kindergarten_id = ?`, [req.params.id, kindergartenId], function (err) {
                if (err)
                    return res.status(500).json({ error: err.message });
                if (this.changes === 0)
                    return res.status(404).json({ error: 'Inspection not found' });
                res.json({ success: true });
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}
