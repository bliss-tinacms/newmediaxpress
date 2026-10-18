import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = dirname(fileURLToPath(import.meta.url));
const envFile = process.env.SITE_ENV_FILE
  ? resolve(process.env.SITE_ENV_FILE)
  : resolve(appRoot, '.env');

if (existsSync(envFile)) {
  const content = readFileSync(envFile, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  }
}

const { startServer } = await import('./dist/server/entry.mjs');

startServer();
