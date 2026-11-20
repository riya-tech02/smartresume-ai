import type { Request, Response } from 'express';
import { AiService } from './ai.service.js';
import { AppError } from '../../utils/AppError.js';

export class AiController {
  static async getStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const status = await AiService.getStatus(req.user.id);
    res.status(200).json({ data: status });
  }

  static async suggest(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const result = await AiService.suggest(req.user.id, req.body);
    res.status(200).json({
      data: {
        feature: result.feature,
        suggestions: result.suggestions,
        meta: result.meta,
      },
    });
  }
}
