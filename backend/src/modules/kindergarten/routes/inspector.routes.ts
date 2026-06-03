import { Router } from 'express';

import { InspectorController } from '../modules/inspector/inspector.controller.js';

const inspectorController = new InspectorController();

export const inspectorRoutes = Router();

inspectorRoutes.use('/audits', inspectorController.router);
inspectorRoutes.use('/inspector', inspectorController.router);
