import puppeteer, { Browser } from 'puppeteer';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES } from '@smartresume/shared';
import { logger } from '../../utils/logger.js';

let sharedBrowser: Browser | null = null;
let activeRenders = 0;

export async function getBrowser(): Promise<Browser> {
  if (!sharedBrowser || !sharedBrowser.connected) {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ];

    sharedBrowser = await puppeteer.launch({
      headless: true,
      executablePath: env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args,
    });

    sharedBrowser.on('disconnected', () => {
      logger.warn('Puppeteer browser disconnected');
      sharedBrowser = null;
    });
  }

  return sharedBrowser;
}

export async function closeBrowser(): Promise<void> {
  if (sharedBrowser) {
    try {
      await sharedBrowser.close();
    } catch {
      // ignore
    }
    sharedBrowser = null;
  }
}

/**
 * Renders an A4 PDF from the SPA print route with concurrency limits
 */
export async function renderPdf(printUrl: string): Promise<Buffer> {
  if (activeRenders >= env.PDF_MAX_CONCURRENCY) {
    throw new AppError(
      ERROR_CODES.PDF_BUSY,
      503,
      'PDF rendering engine is currently busy. Please retry in a few moments or use browser print.',
    );
  }

  activeRenders++;
  let page;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // SSRF Protection per ARCHITECTURE.md §11 & §20:
    // Abort any external network request outside the allowed CLIENT_URL origin
    await page.setRequestInterception(true);
    const clientOrigin = new URL(env.CLIENT_URL).origin;

    page.on('request', (req) => {
      const reqUrl = req.url();
      if (reqUrl.startsWith('data:') || reqUrl.startsWith('blob:') || reqUrl.startsWith(clientOrigin)) {
        req.continue();
      } else {
        req.abort();
      }
    });

    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    // Navigate to SPA print page
    await page.goto(printUrl, {
      waitUntil: 'networkidle0',
      timeout: env.PDF_TIMEOUT_MS,
    });

    // Wait for the client template to finish rendering and fonts to load
    await page.waitForFunction('window.__PRINT_READY__ === true', {
      timeout: env.PDF_TIMEOUT_MS,
    });

    // Produce A4 PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '14mm',
        bottom: '14mm',
        left: '14mm',
        right: '14mm',
      },
    });

    return Buffer.from(pdfBuffer);
  } catch (err: any) {
    logger.error({ err }, 'Puppeteer PDF generation failed');
    if (err instanceof AppError) throw err;
    throw new AppError(
      ERROR_CODES.PDF_FAILED,
      504,
      'PDF generation timed out or failed. You can print directly using your browser\'s Print dialog.',
    );
  } finally {
    activeRenders--;
    if (page) {
      try {
        await page.close();
      } catch {
        // ignore
      }
    }
  }
}
