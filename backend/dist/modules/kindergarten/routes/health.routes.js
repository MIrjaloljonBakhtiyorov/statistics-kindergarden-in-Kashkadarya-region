import { Router } from 'express';
import { HealthController } from '../modules/health/health.controller.js';
const healthController = new HealthController();
export const healthRoutes = Router();
healthRoutes.post('/health/batch', healthController.saveBatch.bind(healthController));
healthRoutes.get('/health/history/:groupId', healthController.getHistory.bind(healthController));
healthRoutes.get('/health/archive', healthController.getArchive.bind(healthController));
healthRoutes.get('/health/allergies', (_req, res) => {
    res.json([]);
});
