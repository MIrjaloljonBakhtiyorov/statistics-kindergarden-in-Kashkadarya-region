import { Router } from 'express';

import { StaffController } from '../modules/staff/staff.controller.js';

const staffController = new StaffController();

export const staffRoutes = Router();

staffRoutes.get('/staff', staffController.getAll);
staffRoutes.post('/staff', staffController.create);
staffRoutes.put('/staff/:id', staffController.update);
staffRoutes.delete('/staff/:id', staffController.delete);
