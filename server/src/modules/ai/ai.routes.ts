import { Router } from 'express';
import { AiController } from './ai.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { aiSuggestSchema } from '@smartresume/shared';
import { aiRateLimiter } from '../../middleware/rateLimiters.js';

export const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.get('/status', AiController.getStatus);
aiRouter.post('/suggest', aiRateLimiter, validate({ body: aiSuggestSchema }), AiController.suggest);
