import { Router } from 'express';
import { AtsController } from './ats.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { runAtsSchema } from '@smartresume/shared';
import { atsRateLimiter } from '../../middleware/rateLimiters.js';

export const atsRouter = Router({ mergeParams: true });

atsRouter.use(authenticate);

atsRouter.post('/', atsRateLimiter, validate({ body: runAtsSchema }), AtsController.analyze);
atsRouter.get('/', AtsController.getHistory);
atsRouter.get('/:analysisId', AtsController.getAnalysisById);
