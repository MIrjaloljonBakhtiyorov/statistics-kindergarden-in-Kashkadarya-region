import { Router } from 'express';
import { GroupsController } from '../modules/groups/groups.controller.js';
const groupsController = new GroupsController();
export const groupsRoutes = Router();
groupsRoutes.get('/groups', groupsController.getAll);
groupsRoutes.post('/groups', groupsController.create);
groupsRoutes.put('/groups/:id', groupsController.update);
groupsRoutes.delete('/groups/:id', groupsController.delete);
