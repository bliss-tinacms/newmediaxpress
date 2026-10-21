#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const strictRuntime = process.argv.includes('--runtime');
const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => readFileSync(join(root, path), 'utf8');

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = relative(root, path).replaceAll('\\', '/');
    if (['.git', 'node_modules', 'dist', '.astro'].includes(name) || rel === 'public/admin' || rel.startsWith('public/admin/')) continue;
    if (statSync(path).isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function loadDotEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const blogSchema = read('tina/collections/blog.ts');
if (!/name:\s*["']categories["'][\s\S]{0,300}type:\s*["']string["'][\s\S]{0,300}list:\s*true[\s\S]{0,300}CategoryCheckboxGroupField/.test(blogSchema)) {
  fail('Blog categories must use the collection-backed CategoryCheckboxGroupField with a string-list schema.');
}
if (/CATEGORY_OPTIONS|src\/content\/category\/[A-Za-z0-9_-]+\.json/.test(blogSchema)) fail('Blog collection contains hardcoded category options or document paths.');
const categoryFieldPath = join(root, 'tina/fields/category-checkbox-group.tsx');
if (!existsSync(categoryFieldPath)) fail('Collection-backed category field is missing.');
else {
  const field = readFileSync(categoryFieldPath, 'utf8');
  if (!/cms\.api\.tina\.request/.test(field) || !/categoryConnection/.test(field) || !/pageInfo/.test(field)) {
    fail('Category UI must paginate the authenticated Tina Category collection.');
  }
  if (/CATEGORY_OPTIONS|updateBlog|fetch\s*\(/.test(field)) fail('Category UI contains hardcoded options or its own mutation transport.');
  if (!/input\.onChange/.test(field)) fail('Category UI must update Tina form state through input.onChange.');
}

const blogBody = read('src/components/islands/BlogBody.astro');
if (/primaryCategory|categoryItems\.find\s*\(/.test(blogBody)) fail('MULTICAT-LOCK forbids choosing one primary category for the public article header.');
if (!/categoryBadges\.map\s*\(/.test(blogBody) || !/ah-k__item/.test(blogBody) || !/data-category-count/.test(blogBody)) {
  fail('MULTICAT-LOCK requires one public article badge/link for every selected category.');
}
const fullcheck = read('scripts/tina-fullcheck.py');
if (!/CategoryBadgeParser/.test(fullcheck) || !/actual_categories\s*!=\s*expected_categories/.test(fullcheck) || !/len\(expected_categories\)\s*<\s*2/.test(fullcheck)) {
  fail('TINA-FULLCHECK must compare the complete backend category array with all public article badges using a two-category fixture.');
}
if (!/AUTHOR-ISLAND-EDITABILITY-001/.test(fullcheck) || !/fetch_author_island/.test(fullcheck) || !/queryLength/.test(fullcheck) || !/primaryCount/.test(fullcheck)) {
  fail('TINA-FULLCHECK must enforce AUTHOR-ISLAND-EDITABILITY-001 with real query, variables, user data, and one primary form.');
}
if (!/EMPTY-POST-LIST-001/.test(fullcheck) || !/categoryConnection/.test(fullcheck) || !/data-empty-post-list/.test(fullcheck) || !/No published posts yet\./.test(fullcheck)) {
  fail('TINA-FULLCHECK must enforce EMPTY-POST-LIST-001 against a real zero-post category and a non-empty control archive.');
}
const multiCatFixture = read('src/content/blog/why-grocery-prices-stopped-falling-in-september.mdx').split('---')[1] || '';
const fixtureCategoryBlock = multiCatFixture.match(/categories:\s*\n((?:\s+-\s+[^\n]+\n?)+)/)?.[1] || '';
if ((fixtureCategoryBlock.match(/^\s+-\s+/gm) || []).length < 2) fail('MULTICAT-LOCK fixture must retain at least two categories.');

const authorArchive = read('src/components/demo/DemoAuthorArchive.astro');
const categoryArchive = read('src/components/demo/DemoCategoryArchive.astro');
const emptyPostList = read('src/components/demo/EmptyPostList.astro');
const authorRoute = read('src/pages/author/[...slug].astro');
const dataSource = read('src/lib/data.ts');
if (!/<TinaIsland\s+name=["']author["'][\s\S]{0,200}params=\{\{\s*slug:\s*parsed\.slug\s*\}\}[\s\S]{0,100}primary/.test(authorRoute)) {
  fail('AUTHOR-ISLAND-EDITABILITY-001 requires the canonical author route to own a primary author TinaIsland.');
}
if (/return\s+await\s+requestWithMetadata\(client\.queries\.user\(/.test(dataSource)) {
  fail('AUTHOR-ISLAND-EDITABILITY-001 forbids passing an unresolved generated User request into requestWithMetadata.');
}
if (!/fetchLiveTinaResult<\{ user: any \}>\(UserDocument/.test(dataSource) || !/Author editor query returned no authoritative Tina document/.test(dataSource)) {
  fail('AUTHOR-ISLAND-EDITABILITY-001 requires direct authoritative User metadata and fail-closed generated fallback validation.');
}
if (!/data-empty-post-list/.test(emptyPostList) || !/No published posts yet\./.test(emptyPostList) || !/role=["']status["']/.test(emptyPostList)) {
  fail('ASTRO-DEMO-LOCK / EMPTY-POST-LIST-001 requires the accessible shared “No published posts yet.” state.');
}
for (const [source, label] of [[categoryArchive, 'category/blog archives'], [authorArchive, 'author archives']]) {
  if (!/import\s+EmptyPostList/.test(source) || !/\{!lead\s*&&\s*<EmptyPostList\s*\/>\}/.test(source)) {
    fail(`ASTRO-DEMO-LOCK / EMPTY-POST-LIST-001 requires the shared empty state in ${label}.`);
  }
}
const nmxCss = read('src/styles/newmediaxpress.css');
if (/<small>\s*(?:Latest|\{author\.latestLabel\})\s*<\/small>/.test(authorArchive)) {
  fail('ASTRO-DEMO-LOCK forbids the extra Latest pill in the Jessica author lead story.');
}
for (const requiredRule of [
  '.nx-author .nx-author-hero__inner>div>span{align-self:flex-start}',
  '.nx-author .nx-lead-story{padding-bottom:clamp(48px,6vw,80px)}',
  '.nx-archive>.nx-lead-story+.nx-cta{margin-top:clamp(48px,6vw,80px)}',
  '.nx-author .nx-author-hero__inner{padding-top:clamp(56px,5.625vw,87px);padding-bottom:24px}',
  '.nx-author .nx-lead-story{padding:clamp(48px,6vw,80px) 0 clamp(48px,6vw,80px) clamp(32px,4.7vw,68px)}',
  '.nx-author .nx-lead-story>a{grid-template-columns:repeat(2,minmax(0,620px));align-items:start}',
  '.nx-author .nx-lead-story>a>img{aspect-ratio:20/9}',
  '.nx-empty-post-list{padding-top:clamp(48px,6vw,80px);padding-bottom:clamp(48px,6vw,80px)}',
]) {
  if (!nmxCss.includes(requiredRule)) fail(`ASTRO-DEMO-LOCK missing Jessica author fixture rule: ${requiredRule}`);
}

const proxy = read('src/pages/tina-content-proxy.ts');
if (/updateBlog|category-overrides|normalizeCategories|persistLocal|stripConfig|overrideBlogResponse/.test(proxy)) {
  fail('Tina proxy contains collection-specific compatibility or persistence logic.');
}
if (/request\.headers\.get\(['"]x-api-key['"]\)\s*\|\|\s*env\(['"]TINA_TOKEN['"]\)/.test(proxy)) {
  fail('Tina proxy must not elevate anonymous requests with the server-side Tina token.');
}

const forbidden = [
  [/First\s*For\s*News|First\s*for\s*News|FirstForNews/gi, 'former publication brand'],
  [/firstfornews\.net/gi, 'former publication domain'],
  [/boilerplate\.blissdrive\.net/gi, 'starter deployment domain baked into source'],
  [/40bc8cd1-d0fe-4061-b99c-d91be2de59e0/gi, 'starter Tina client ID'],
  [/xppwzoep/gi, 'starter Formspree form ID'],
  [/bliss-tinacms\/boilerplate/gi, 'starter repository baked into runtime source'],
  [/Splash\s*News\s*Wire/gi, 'former publication brand'],
  [/[A-Z]:\\\\Users\\\\/g, 'machine-specific Windows path'],
];
const textExtensions = new Set(['.ts', '.tsx', '.astro', '.js', '.mjs', '.json', '.md', '.mdx', '.py', '.yml', '.yaml', '.css']);
for (const path of walk(root)) {
  if (!textExtensions.has(extname(path))) continue;
  const rel = relative(root, path).replaceAll('\\', '/');
  if (['scripts/validate-starter.mjs', 'scripts/provision-site.mjs'].includes(rel)) continue;
  const text = readFileSync(path, 'utf8');
  for (const [pattern, label] of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) fail(`${rel}: contains ${label}.`);
  }
  if (/NEXT_PUBLIC_TINA_TOKEN|PUBLIC_TINA_TOKEN|TINA_PUBLIC_TINA_TOKEN/.test(text) && !rel.startsWith('tina/__generated__/')) {
    fail(`${rel}: uses a public-prefixed Tina token variable.`);
  }
}

for (const path of walk(join(root, 'src/content'))) {
  if (!['.md', '.mdx', '.json'].includes(extname(path))) continue;
  const text = readFileSync(path, 'utf8');
  for (const match of text.matchAll(/src\/content\/(category|user)\/([^\s'"\]]+\.(?:json|mdx))/g)) {
    const target = join(root, 'src/content', match[1], match[2]);
    if (!existsSync(target)) fail(`${relative(root, path)}: missing reference ${match[0]}.`);
  }
}

if (!existsSync(join(root, 'pnpm-lock.yaml'))) fail('pnpm-lock.yaml is required for reproducible provisioning.');
if (!existsSync(join(root, 'tina/tina-lock.json'))) fail('tina/tina-lock.json is required after schema changes.');
if (!existsSync(join(root, 'scripts/provision-site.mjs'))) fail('scripts/provision-site.mjs is required for repeatable site provisioning.');
if (!existsSync(join(root, 'site.manifest.example.json'))) fail('site.manifest.example.json is required for repeatable site provisioning.');
if (!existsSync(join(root, 'scripts/tina-build-safe.mjs'))) fail('scripts/tina-build-safe.mjs is required for direct Cloud schema checks and secret-safe generation.');
if (!existsSync(join(root, 'scripts/sanitize-generated-client.mjs'))) fail('scripts/sanitize-generated-client.mjs is required to keep generated credentials out of source control.');
if (!existsSync(join(root, 'scripts/validate-demo-lock-preflight.mjs'))) fail('scripts/validate-demo-lock-preflight.mjs is required for fail-closed ASTRO-DEMO-LOCK readiness.');
if (!existsSync(join(root, 'scripts/test-demo-lock-preflight-negative.mjs'))) fail('scripts/test-demo-lock-preflight-negative.mjs is required to prove ASTRO-DEMO-LOCK preflight rejection.');
if (!existsSync(join(root, 'TINA-MIGRATION-GOLD.md'))) fail('TINA-MIGRATION-GOLD.md is required as the canonical migration and acceptance process.');
else {
  const processDocument = read('TINA-MIGRATION-GOLD.md');
  const requiredGates = [
    ['Source-release ready', 'source-release and cloud/live acceptance separation'],
    ['Preserve exact demo design', 'exact-demo design and CSS-isolation gate'],
    ['Keep visible output Tina-driven', 'dynamic Tina content authority gate'],
    ['Make runtime environment authoritative', 'application-root environment precedence gate'],
    ['Query the verified Tina destination first', 'destination Tina endpoint and identity gate'],
    ['Treat schema changes as migrations', 'schema/lock/cloud migration gate'],
    ['MULTICAT-LOCK', 'multi-category preservation gate'],
    ['one demo record shows one category', 'demo-cardinality must not collapse multi-category output'],
    ['Keep public email addresses ordinary', 'public email anti-obfuscation gate'],
    ['Build and deploy one immutable release', 'atomic immutable deployment gate'],
    ['TINA-FULLCHECK', 'collection-complete fullcheck gate'],
    ['PUBLISHER-ADMIN-GATE', 'authenticated live-admin acceptance gate'],
    ['AUTHOR-ISLAND-EDITABILITY-001', 'author island editability regression gate'],
    ['EMPTY-POST-LIST-001', 'empty post-list regression gate'],
    ['ASTRO-DEMO-LOCK', 'empty archive exact-demo lock'],
    ['exact restoration', 'reversible cleanup gate'],
    ['FAILURE-DERIVED EXECUTION GATES', 'failure-derived executable prevention section'],
    ['NO-PREMATURE-COMPLETION', 'no-premature-completion gate'],
    ['AUTHORITY-FIRST', 'authoritative-source identity gate'],
    ['GATE-SELF-TEST', 'controlled-negative validator self-test gate'],
    ['PRODUCTION-DATA-SHAPE', 'production Tina representation gate'],
    ['DESTINATION-ENV-ONLY', 'clean destination-environment gate'],
    ['FRESH-PROCESS-AND-SHUTDOWN', 'fresh-server and orderly-shutdown gate'],
    ['SERIAL-BROWSER-GATES', 'serial browser-suite gate'],
    ['RESOURCE-PREFLIGHT', 'disk/memory/browser resource gate'],
    ['DETERMINISTIC-TOOLCHAIN', 'explicit toolchain path gate'],
    ['AUTHENTICATED-GIT-PREFLIGHT', 'authenticated Git transport gate'],
    ['PUBLISHER-BEFORE-FINAL-SHA', 'Publisher-before-final-release lineage gate'],
    ['PROJECT-SECRET-MAP', 'project-specific protected-input lookup gate'],
    ['CPANEL-ENDPOINT-NORMALIZATION', 'cPanel host and port normalization gate'],
    ['CPANEL-RESPONSE-NORMALIZATION', 'cPanel API shape normalization gate'],
    ['TRUE-ORIGIN-PROOF', 'real origin and vhost proof gate'],
    ['AUTHENTICATED-ISLAND-POST', 'authenticated Tina island POST gate'],
    ['CANONICAL-ADMIN-LOGIN', 'canonical admin authentication gate'],
    ['SELF-CONTAINED-RUNTIME', 'release runtime-dependency ownership gate'],
    ['RETENTION-CLEANUP', 'post-release retention and cron cleanup gate'],
    ['STRUCTURED-EVIDENCE', 'machine-readable evidence gate'],
    ['EVIDENCE-ARTIFACT', 'sanitized admin transaction evidence gate'],
    ['CHECKPOINT-NOT-COMPLETION', 'ordered end-to-end acceptance gate'],
    ['MINIMAL-RETRY-DIAGNOSTICS', 'diagnostic-harness-before-product-change gate'],
    ['LITERAL-VISUAL-NON-APPROXIMATION', 'literal visual parity gate'],
    ['SHA-HTTP-NOT-VISUAL-PROOF', 'identity is not visual proof gate'],
    ['CLOUD-SOURCE-PRECEDENCE', 'Cloud source-precedence gate'],
    ['REAL-WHEEL-STICKY-PROOF', 'settled real-wheel sticky gate'],
    ['RESPONSIVE-RAIL-TOC-CONTRACT', 'desktop/mobile rail and TOC gate'],
    ['COMPLETE-TEMPLATE-FAMILY-MATRIX', 'all-template-family coverage gate'],
    ['FIXTURE-INTEGRITY-FIRST', 'immutable fixture integrity gate'],
    ['DUAL-ARTIFACT-SECRET-SCAN', 'dist and archive secret-scan gate'],
    ['EXACT-SHA-PACKAGE-POINTER-PARITY', 'exact immutable package and pointer parity gate'],
    ['FINAL-POST-CLEANUP-ACCEPTANCE', 'post-cleanup acceptance gate'],
    ['EXECUTABLE-LOCK-READINESS', 'executable lock readiness gate'],
  ];
  for (const [needle, label] of requiredGates) {
    if (!processDocument.includes(needle)) fail(`TINA-MIGRATION-GOLD.md is missing the ${label}.`);
  }
}
if (!existsSync(join(root, 'ASTRO-DEMO-LOCK.md'))) fail('ASTRO-DEMO-LOCK.md is required as the repository-level exact-demo contract.');
else {
  const demoLock = read('ASTRO-DEMO-LOCK.md');
  const requiredDemoControls = [
    'NO-PREMATURE-COMPLETION', 'AUTHORITY-FIRST', 'GATE-SELF-TEST', 'PRODUCTION-DATA-SHAPE',
    'DESTINATION-ENV-ONLY', 'FRESH-PROCESS-AND-SHUTDOWN', 'SERIAL-BROWSER-GATES',
    'RESOURCE-PREFLIGHT', 'DETERMINISTIC-TOOLCHAIN', 'PUBLISHER-BEFORE-FINAL-SHA',
    'TRUE-ORIGIN-AND-LIVE-PROOF', 'SELF-CONTAINED-RUNTIME-AND-CLEANUP', 'STRUCTURED-EVIDENCE',
    'CHECKPOINT-NOT-COMPLETION', 'MINIMAL-RETRY-DIAGNOSTICS', 'LITERAL-VISUAL-NON-APPROXIMATION',
    'SHA-HTTP-NOT-VISUAL-PROOF', 'CLOUD-SOURCE-PRECEDENCE', 'REAL-WHEEL-STICKY-PROOF',
    'RESPONSIVE-RAIL-TOC-CONTRACT', 'COMPLETE-TEMPLATE-FAMILY-MATRIX', 'FIXTURE-INTEGRITY-FIRST',
    'DUAL-ARTIFACT-SECRET-SCAN', 'EXACT-SHA-PACKAGE-POINTER-PARITY', 'FINAL-POST-CLEANUP-ACCEPTANCE',
    'EXECUTABLE-LOCK-READINESS',
  ];
  for (const marker of requiredDemoControls) {
    if (!demoLock.includes(marker)) fail(`ASTRO-DEMO-LOCK.md is missing mandatory control ${marker}.`);
  }
  for (const marker of ['AUTHENTICATED-GIT-PREFLIGHT', 'PROJECT-SECRET-MAP', 'CPANEL-ENDPOINT-NORMALIZATION', 'CPANEL-RESPONSE-NORMALIZATION']) {
    if (!demoLock.includes(marker)) fail(`ASTRO-DEMO-LOCK.md is missing inherited GOLD blocker ${marker}.`);
  }
}
if (!existsSync(join(root, 'PUBLISHER-ADMIN-GATE.md'))) fail('PUBLISHER-ADMIN-GATE.md is required for authenticated live-admin acceptance.');
else {
  const publisherGate = read('PUBLISHER-ADMIN-GATE.md');
  for (const needle of ['AUTHOR-ISLAND-EDITABILITY-001', 'query', 'variables.relativePath', 'temporary marker', 'Restore the exact original']) {
    if (!publisherGate.includes(needle)) fail(`PUBLISHER-ADMIN-GATE.md is missing ${needle}.`);
  }
}
for (const path of walk(root)) {
  const rel = relative(root, path).replaceAll('\\', '/');
  if (/(?:\.before-|\.bak(?:-|\/))[0-9-]*/.test(rel)) fail(`${rel}: backup files must not be tracked or shipped.`);
  if (/^_hermes-/.test(rel) || rel === 'nulmkdir') fail(`${rel}: one-off migration helper/scratch files must not be tracked or shipped.`);
}
const gitignore = read('.gitignore');
if (/^pnpm-lock\.yaml$/m.test(gitignore)) fail('pnpm-lock.yaml must be tracked.');
if (!/^\.env$/m.test(gitignore) && !/^\.env\*$/m.test(gitignore)) fail('.env secrets must be ignored.');
if (!/^site\.manifest\.json$/m.test(gitignore)) fail('Filled site.manifest.json files must be ignored.');
const packageJson = JSON.parse(read('package.json'));
for (const command of ['site:provision', 'sanitize:generated', 'validate:starter', 'validate:site', 'tina:fullcheck', 'astro:demo-lock:preflight', 'astro:demo-lock:preflight:negative']) {
  if (!packageJson.scripts?.[command]) fail(`package.json is missing ${command}.`);
}
for (const [command, expected] of Object.entries({
  'astro:demo-lock:preflight': 'node scripts/validate-demo-lock-preflight.mjs',
  'astro:demo-lock:preflight:negative': 'node scripts/test-demo-lock-preflight-negative.mjs',
})) {
  if (packageJson.scripts?.[command] !== expected) fail(`package.json ${command} must equal ${expected}.`);
}
const demoLockPreflight = read('scripts/validate-demo-lock-preflight.mjs');
const demoLockPreflightNegative = read('scripts/test-demo-lock-preflight-negative.mjs');
for (const marker of ['duplicate-manifest-path', 'non-normalized-manifest-path', 'fixture-hash-drift', 'unmanifested-fixture', 'fixture-symlink', 'fixture-realpath-outside-authority']) {
  if (!demoLockPreflight.includes(marker)) fail(`ASTRO-DEMO-LOCK preflight is missing fixture-integrity marker ${marker}.`);
}
for (const mutation of ['duplicate-manifest-path', 'non-normalized-manifest-path', 'fixture-hash-drift', 'unmanifested-fixture', 'fixture-symlink']) {
  if (!demoLockPreflightNegative.includes(mutation)) fail(`ASTRO-DEMO-LOCK negative suite is missing fixture-integrity mutation ${mutation}.`);
}
const astroConfig = read('astro.config.mjs');
if (!/loadEnv\s*\(/.test(astroConfig) || !/configuredEnv\(['"]SITE_URL['"]\)/.test(astroConfig)) {
  fail('astro.config.mjs must load SITE_URL from the active .env mode before generating absolute URLs.');
}
const baseHead = read('src/components/BaseHead.astro');
if (!/declaredIsLocal/.test(baseHead) || !/requestIsPublic/.test(baseHead)) {
  fail('BaseHead must replace only a localhost placeholder with the public request origin.');
}
if (packageJson.scripts?.['provision:clone']) fail('Legacy clone/search-replace provisioning command must not exist.');

for (const relative of ['tina/__generated__/client.ts', 'tina/__generated__/types.ts', 'tina/__generated__/types.js']) {
  const generated = read(relative);
  if (/\/home\/[^/]+\//.test(generated)) fail(`${relative} contains a machine-specific home path.`);
  if (/token:\s*['"][A-Za-z0-9_-]{20,}['"]/.test(generated)) fail(`${relative} contains a generated credential literal.`);
}

const globalConfig = JSON.parse(read('src/content/config/config.json'));
const endpoint = String(globalConfig.contactForm?.formspreeEndpoint || '');
if (endpoint && !/^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+$/.test(endpoint)) fail('Global Formspree endpoint is malformed.');

if (strictRuntime) {
  loadDotEnv();
  const required = [
    'SITE_PROVISION_MODE', 'SITE_URL', 'NEXT_PUBLIC_TINA_CLIENT_ID', 'TINA_TOKEN', 'NEXT_PUBLIC_TINA_BRANCH',
    'GITHUB_CONTENT_REPO', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET', 'CLOUDINARY_ROOT_FOLDER', 'NEXT_PUBLIC_TINA_CONTENT_API_URL',
  ];
  for (const name of required) if (!String(process.env[name] || '').trim()) fail(`Missing runtime variable ${name}.`);
  for (const name of required) {
    const value = String(process.env[name] || '').toLowerCase();
    if (/replace-with|example\.com|placeholder|your[_-]/.test(value)) fail(`Runtime variable ${name} still contains a placeholder.`);
  }
  const siteUrl = String(process.env.SITE_URL || '');
  const provisionMode = String(process.env.SITE_PROVISION_MODE || '');
  if (!['independent', 'same-site-migration'].includes(provisionMode)) fail('SITE_PROVISION_MODE must be independent or same-site-migration.');
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.protocol !== 'https:' || parsed.origin !== siteUrl || parsed.username || parsed.password) {
        fail('SITE_URL must be a valid HTTPS origin without credentials, path, query, or fragment.');
      }
    } catch {
      fail('SITE_URL must be a valid HTTPS origin without credentials, path, query, or fragment.');
    }
  }
  const repo = String(process.env.GITHUB_CONTENT_REPO || '');
  if (repo && !/^[^/\s]+\/[^/\s]+$/.test(repo)) fail('GITHUB_CONTENT_REPO must use owner/repository format.');
  const folder = String(process.env.CLOUDINARY_ROOT_FOLDER || '').toLowerCase();
  if (provisionMode === 'independent' && ['boilerplate', 'starter', 'default'].includes(folder)) fail('CLOUDINARY_ROOT_FOLDER must be unique to the independent site.');
  const apiUrl = String(process.env.NEXT_PUBLIC_TINA_CONTENT_API_URL || '');
  if (siteUrl && apiUrl !== `${siteUrl}/tina-content-proxy`) fail('NEXT_PUBLIC_TINA_CONTENT_API_URL must use this site origin.');
}

if (failures.length) {
  console.error(`Starter validation failed (${new Set(failures).size}):`);
  for (const item of [...new Set(failures)]) console.error(`- ${item}`);
  process.exit(1);
}
console.log(`Starter validation passed${strictRuntime ? ' (provisioned site runtime)' : ' (neutral source)'}.`);
