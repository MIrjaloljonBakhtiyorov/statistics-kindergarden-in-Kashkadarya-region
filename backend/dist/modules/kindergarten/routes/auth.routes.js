import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller.js';
const authController = new AuthController();
export const authRoutes = Router();
authRoutes.post('/auth/login', authController.login);
authRoutes.post('/auth/parent-login', authController.parentLogin);
