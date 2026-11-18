import { Router } from 'express';
import { JobMatchController } from './jobmatch.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { jobMatchSchema } from '@smartresume/shared';
import { atsRateLimiter } from '../../middleware/rateLimiters.js';

export const jobMatchRouter = Router({ mergeParams: true });

jobMatchRouter.use(authenticate);

jobMatchRouter.post('/', atsRateLimiter, validate({ body: jobMatchSchema }), JobMatchController.match);
jobMatchRouter.get('/latest', JobMatchController.getLatest);
