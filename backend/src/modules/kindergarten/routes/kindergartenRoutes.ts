import { Router } from 'express';

import { authRoutes } from './auth.routes.js';
import { attendanceRoutes } from './attendance.routes.js';
import { chefRoutes } from './chef.routes.js';
import { childrenRoutes } from './children.routes.js';
import { foodRoutes } from './food.routes.js';
import { groupsRoutes } from './groups.routes.js';
import { healthExtraRoutes } from './healthExtra.routes.js';
import { healthRoutes } from './health.routes.js';
import { inspectorRoutes } from './inspector.routes.js';
import { inventoryRoutes } from './inventory.routes.js';
import { medicalInventoryRoutes } from './medicalInventory.routes.js';
import { messagesRoutes } from './messages.routes.js';
import { operationsRoutes } from './operations.routes.js';
import { parentsRoutes } from './parents.routes.js';
import { roleAccountsRoutes } from './roleAccounts.routes.js';
import { settingsRoutes } from './settings.routes.js';
import { staffRoutes } from './staff.routes.js';

const router = Router();

router.use(authRoutes);
router.use(settingsRoutes);
router.use(roleAccountsRoutes);
router.use(childrenRoutes);
router.use(groupsRoutes);
router.use(staffRoutes);
router.use(parentsRoutes);
router.use(attendanceRoutes);
router.use(foodRoutes);
router.use(inventoryRoutes);
router.use(medicalInventoryRoutes);
router.use(chefRoutes);
router.use(messagesRoutes);
router.use(healthRoutes);
router.use(healthExtraRoutes);
router.use(inspectorRoutes);
router.use(operationsRoutes);

export default router;
