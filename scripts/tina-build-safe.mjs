#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { sanitizeGeneratedClient } from './sanitize-generated-client.mjs';

const local = process.argv.includes('--local');
const run = (args, env = process.env) => spawnSync('pnpm', ['exec', 'tinacms', ...args], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

let status = 1;
try {
  if (local) {
    status = run(['build', '--local', '--skip-cloud-checks', '--noTelemetry', '-c', 'astro build']).status ?? 1;
  } else {
    // A same-origin proxy is correct for the deployed editor, but Tina's schema
    // status endpoint must be checked directly against Tina Cloud first.
    const cloudEnv = { ...process.env, TINA_DIRECT_CLOUD_CHECK: '1' };
    const cloudCheck = run(['build', '--noTelemetry', '-c', 'node --version'], cloudEnv);
    if ((cloudCheck.status ?? 1) !== 0) {
      status = cloudCheck.status ?? 1;
    } else {
      // Generate the proxy-configured admin, then sanitize the generated client
      // before Astro bundles server code. Tina's generated client otherwise
      // contains the build-time token as a literal in dist/server.
      const proxyBuild = run(['build', '--skip-cloud-checks', '--noTelemetry', '-c', 'node --version']);
      if ((proxyBuild.status ?? 1) !== 0) {
        status = proxyBuild.status ?? 1;
      } else {
        sanitizeGeneratedClient();
        const serverEnv = { ...process.env };
        delete serverEnv.TINA_TOKEN;
        status = spawnSync('pnpm', ['exec', 'astro', 'build'], {
          stdio: 'inherit',
          env: serverEnv,
          shell: process.platform === 'win32',
        }).status ?? 1;
      }
    }
  }
} finally {
  sanitizeGeneratedClient();
}
process.exit(status);
