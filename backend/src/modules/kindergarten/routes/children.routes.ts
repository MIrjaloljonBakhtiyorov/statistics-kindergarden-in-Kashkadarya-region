import { Router } from 'express';

import { ChildrenController } from '../modules/children/children.controller.js';

const childrenController = new ChildrenController();

export const childrenRoutes = Router();

childrenRoutes.post('/children', childrenController.create);
childrenRoutes.get('/children', childrenController.getAll);
childrenRoutes.put('/children/:id', childrenController.update);
childrenRoutes.delete('/children/:id', childrenController.delete);
