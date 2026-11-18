import { Router } from 'express';
import { PdfController } from './pdf.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { pdfRateLimiter } from '../../middleware/rateLimiters.js';

export const pdfRouter = Router({ mergeParams: true });

// Export PDF for a resume (protected)
pdfRouter.post('/', authenticate, pdfRateLimiter, PdfController.downloadPdf);

// Public route for Chromium SPA fetching resume data via single-use print token
export const printResumeRouter = Router();
printResumeRouter.get('/resume', PdfController.getPrintResume);
