import { Router } from 'express';
import { ResumesController } from './resumes.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  listResumesSchema,
  createResumeSchema,
  updateResumeSchema,
  duplicateResumeSchema,
} from '@smartresume/shared';

export const resumesRouter = Router();

resumesRouter.use(authenticate);

resumesRouter.get('/', validate({ query: listResumesSchema }), ResumesController.list);
resumesRouter.post('/', validate({ body: createResumeSchema }), ResumesController.create);
resumesRouter.get('/:id', ResumesController.getById);
resumesRouter.patch('/:id', validate({ body: updateResumeSchema }), ResumesController.update);
resumesRouter.delete('/:id', ResumesController.delete);
resumesRouter.post('/:id/duplicate', validate({ body: duplicateResumeSchema }), ResumesController.duplicate);
