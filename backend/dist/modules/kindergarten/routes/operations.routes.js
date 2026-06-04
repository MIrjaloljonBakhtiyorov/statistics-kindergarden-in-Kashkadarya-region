import { Router } from 'express';
import { OperationsRepository } from '../modules/operations/operations.repository.js';
import { resolveKindergartenId } from '../requestContext.js';
const operationsRepository = new OperationsRepository();
export const operationsRoutes = Router();
operationsRoutes.get('/operations', async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        const operations = await operationsRepository.findAll(kindergartenId, Number(req.query.limit) || 20);
        res.json(operations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
operationsRoutes.get('/operations/archived', async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        const operations = await operationsRepository.findArchived(kindergartenId, Number(req.query.limit) || 50);
        res.json(operations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
operationsRoutes.post('/operations/archive/:id', async (req, res) => {
    try {
        const kindergartenId = await resolveKindergartenId(req);
        await operationsRepository.archive(req.params.id, kindergartenId);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
