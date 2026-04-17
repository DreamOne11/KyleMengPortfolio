import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const port = parseInt(process.env.PORT ?? '8080', 10);
const databaseUrl = process.env.DATABASE_URL;
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const config = {
  nodeEnv,
  port,
  databaseUrl,
  frontendUrls: frontendUrl.split(',').map((s) => s.trim()),
  isProduction: nodeEnv === 'production',
} as const;
