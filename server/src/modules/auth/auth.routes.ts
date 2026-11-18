import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from '@smartresume/shared';
import { authRateLimiter, refreshRateLimiter } from '../../middleware/rateLimiters.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate({ body: registerSchema }), AuthController.register);
authRouter.post('/login', authRateLimiter, validate({ body: loginSchema }), AuthController.login);
authRouter.post('/refresh', refreshRateLimiter, AuthController.refresh);
authRouter.post('/logout', AuthController.logout);
