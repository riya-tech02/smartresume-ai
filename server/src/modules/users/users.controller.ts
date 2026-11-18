import type { Request, Response } from 'express';
import { UsersService } from './users.service.js';
import { AppError } from '../../utils/AppError.js';

export class UsersController {
  static async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const user = await UsersService.getMe(req.user.id);
    res.status(200).json({ data: { user } });
  }

  static async updateMe(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const user = await UsersService.updateMe(req.user.id, req.body);
    res.status(200).json({ data: { user } });
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    await UsersService.changePassword(req.user.id, req.body);
    res.status(200).json({ data: { message: 'Password changed successfully' } });
  }

  static async deleteAccount(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    await UsersService.deleteAccount(req.user.id, req.body);
    res.status(200).json({ data: { message: 'Account deleted successfully' } });
  }

  static async exportData(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const exportPayload = await UsersService.exportData(req.user.id);
    res.setHeader('Content-Disposition', `attachment; filename="smartresume_export_${req.user.id}.json"`);
    res.status(200).json({ data: exportPayload });
  }
}
