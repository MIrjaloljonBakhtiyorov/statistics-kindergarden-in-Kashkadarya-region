import { Router } from 'express';

import { ParentPortalController } from './parentPortal.controller.js';

export const parentsRoutes = Router();

const controller = new ParentPortalController();

parentsRoutes.get('/parents', controller.listParents);
parentsRoutes.put('/parents/:id', controller.updateParentAccount);
parentsRoutes.delete('/parents/:id', controller.deleteParentAccount);

parentsRoutes.get('/parent-portal/child-info/:childId', controller.getChildInfo);
parentsRoutes.get('/parent-portal/full-data/:childId', controller.getFullData);
parentsRoutes.get('/parent-portal/login-history/:childId', controller.getParentLoginHistory);
parentsRoutes.put('/parent-portal/profile/:childId', controller.updateProfile);
parentsRoutes.get('/parent-portal/menu/:childId/:date', controller.getMenu);
parentsRoutes.post('/parent-portal/documents', controller.createDocument);
parentsRoutes.delete('/parent-portal/documents/:id', controller.deleteDocument);
parentsRoutes.post('/parent-portal/pickups', controller.createPickup);
parentsRoutes.delete('/parent-portal/pickups/:id', controller.deletePickup);
