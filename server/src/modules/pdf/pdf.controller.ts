import type { Request, Response } from 'express';
import { PdfService } from './pdf.service.js';
import { AppError } from '../../utils/AppError.js';

export class PdfController {
  static async downloadPdf(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthenticated();
    const { buffer, filename } = await PdfService.generateResumePdf(req.user.id, req.params.id as string);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.status(200).end(buffer);
  }

  static async getPrintResume(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string);

    if (!token) {
      throw AppError.unauthenticated('Print token required');
    }

    const resume = await PdfService.getResumeForPrintToken(token);
    res.status(200).json({ data: resume });
  }
}
