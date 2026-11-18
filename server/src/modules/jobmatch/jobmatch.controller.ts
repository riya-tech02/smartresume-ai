import type { Request, Response } from 'express';
import { JobMatchService } from './jobmatch.service.js';
import { AppError } from '../../utils/AppError.js';

export class JobMatchController {
  static async match(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const result = await JobMatchService.match(req.user.id, req.params.id as string, req.body);
    res.status(200).json({ data: result });
  }

  static async getLatest(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const result = await JobMatchService.getLatest(req.user.id, req.params.id as string);
    res.status(200).json({ data: result });
  }
}
