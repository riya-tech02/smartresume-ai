import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(5001),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/smartresume'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters').default('development_jwt_access_secret_min_32_characters_for_smartresume'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().default(7),
  PRINT_TOKEN_SECRET: z.string().min(32, 'PRINT_TOKEN_SECRET must be at least 32 characters').default('development_print_token_secret_min_32_characters_for_smartresume'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  COOKIE_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'none']).default('lax'),
  AI_PROVIDER: z.enum(['gemini', 'openai', 'mock']).default('mock'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().optional().default('gemini-1.5-flash'),
  AI_BASE_URL: z.string().url().optional().default('https://api.openai.com/v1'),
  AI_TIMEOUT_MS: z.coerce.number().int().default(15000),
  AI_DAILY_LIMIT: z.coerce.number().int().default(30),
  PDF_MAX_CONCURRENCY: z.coerce.number().int().default(2),
  PDF_TIMEOUT_MS: z.coerce.number().int().default(20000),
  PUPPETEER_EXECUTABLE_PATH: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment configuration:');
    console.error(result.error.format());
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    // For test fallback
    return envSchema.parse({
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      JWT_ACCESS_SECRET: 'test_jwt_access_secret_min_32_characters_long_super_safe',
      PRINT_TOKEN_SECRET: 'test_print_token_secret_min_32_characters_long_super_safe',
      CLIENT_URL: 'http://localhost:5173',
    });
  }

  // Production safety check
  if (result.data.NODE_ENV === 'production') {
    if (result.data.JWT_ACCESS_SECRET.includes('development') || result.data.PRINT_TOKEN_SECRET.includes('development')) {
      console.error('FATAL: Refusing to start in production with development secrets');
      process.exit(1);
    }
  }

  return result.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
