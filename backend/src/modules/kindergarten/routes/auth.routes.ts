import { Router } from 'express';

import { AuthController } from '../modules/auth/auth.controller.js';

const authController = new AuthController();

export const authRoutes = Router();

authRoutes.post('/auth/login', authController.login);
authRoutes.post('/auth/parent-login', authController.parentLogin);
authRoutes.post('/auth/send-email-code', authController.sendEmailCode);
authRoutes.post('/auth/register-user', authController.registerUser);
authRoutes.post('/auth/user-login', authController.userLogin);
