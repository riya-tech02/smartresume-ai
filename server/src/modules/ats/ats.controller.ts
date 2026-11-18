import type { Request, Response } from 'express';
import { AtsService } from './ats.service.js';
import { AppError } from '../../utils/AppError.js';

export class AtsController {
  static async analyze(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const report = await AtsService.analyzeResume(req.user.id, req.params.id as string, req.body.jobDescription);
    res.status(200).json({ data: report });
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const history = await AtsService.getHistory(req.user.id, req.params.id as string);
    res.status(200).json({ data: history });
  }

  static async getAnalysisById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const report = await AtsService.getAnalysis(req.user.id, req.params.id as string, req.params.analysisId as string);
    res.status(200).json({ data: report });
  }
}
