import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { requestId } from './middleware/requestId.js';
import { httpLogger } from './utils/logger.js';
import { globalRateLimiter } from './middleware/rateLimiters.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routers
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { templatesRouter } from './modules/templates/templates.routes.js';
import { resumesRouter } from './modules/resumes/resumes.routes.js';
import { atsRouter } from './modules/ats/ats.routes.js';
import { jobMatchRouter } from './modules/jobmatch/jobmatch.routes.js';
import { pdfRouter, printResumeRouter } from './modules/pdf/pdf.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';

export function createApp() {
  const app = express();

  // Hardening & Security
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestId);
  app.use(httpLogger);

  // Global rate limiter
  app.use(globalRateLimiter);

  // API v1 router
  const apiV1 = express.Router();

  // Health check endpoint (PRD / ARCHITECTURE #1)
  apiV1.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount modules
  apiV1.use('/auth', authRouter);
  apiV1.use('/users', usersRouter);
  apiV1.use('/templates', templatesRouter);
  apiV1.use('/ai', aiRouter);
  apiV1.use('/print', printResumeRouter);

  // Resume nested routes
  resumesRouter.use('/:id/ats', atsRouter);
  resumesRouter.use('/:id/job-match', jobMatchRouter);
  resumesRouter.use('/:id/pdf', pdfRouter);
  apiV1.use('/resumes', resumesRouter);

  app.use('/api/v1', apiV1);

  // Catch 404 & Centralized Error Handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
