import type { Request, Response } from 'express';
import { ResumesService } from './resumes.service.js';
import { AppError } from '../../utils/AppError.js';

export class ResumesController {
  static async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const result = await ResumesService.listResumes(req.user.id, req.query as unknown as Parameters<typeof ResumesService.listResumes>[1]);
    res.status(200).json({ data: result.resumes, meta: result.meta });
  }

  static async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const resume = await ResumesService.createResume(req.user.id, req.body);
    res.status(201).json({ data: resume });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const resume = await ResumesService.getResume(req.user.id, req.params.id as string);
    res.status(200).json({ data: resume });
  }

  static async update(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const updated = await ResumesService.updateResume(req.user.id, req.params.id as string, req.body);
    res.status(200).json({ data: updated });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    await ResumesService.deleteResume(req.user.id, req.params.id as string);
    res.status(200).json({ data: { message: 'Resume deleted successfully' } });
  }

  static async duplicate(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const resume = await ResumesService.duplicateResume(req.user.id, req.params.id as string, req.body);
    res.status(201).json({ data: resume });
  }
}
