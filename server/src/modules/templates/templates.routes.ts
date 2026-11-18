import { Router } from 'express';
import { TEMPLATES } from '@smartresume/shared';

export const templatesRouter = Router();

templatesRouter.get('/', (_req, res) => {
  res.status(200).json({
    data: TEMPLATES,
  });
});
