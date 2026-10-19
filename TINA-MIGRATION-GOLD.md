# TINA-MIGRATION-GOLD

This is the mandatory release process for turning this repository into a stable, migration-ready Astro + TinaCMS publisher site.

The protected rollback baseline remains tag `tina-migration-gold-2026-10-17`. Do not move or rewrite that tag. Improvements are committed above it and must pass every applicable gate below before a newer release is described as migration-ready.

## Acceptance states

Never collapse these into one “done” claim:

1. **Source-release ready** — identity-neutral tracked tree, deterministic provisioning, frozen install, local Tina/Astro validation, schema/lock consistency, secret-safe diff, exact-demo containment where applicable, and a committed release candidate.
2. **Cloud/live accepted** — candidate pushed to the connected branch, Tina Cloud indexed, normal cloud-checked build passed, synchronized artifact set deployed, authenticated Publisher save/public/restore transactions passed, integrations verified, and desktop/mobile live checks passed.

A local build or `--skip-cloud-checks` build proves only local source integrity. It never proves Tina Cloud or production acceptance.

## Non-negotiable process

### 1. Preserve exact demo design

When a demo/source is supplied:

- Copy its DOM structure, classes, declarations, fonts, colors, sizes, weights, spacing, section order, assets, and responsive rules exactly.
- **Always copy the demo’s actual heading font family and body font family.** Discover them from the authoritative demo’s computed styles and font binaries; do not infer them from the old site, an earlier migration, a CSS variable name, or a font import alone.
- Never reuse or allow inherited legacy heading/body fonts merely because they are already installed or present in shared CSS. Explicitly bind every demo-owned heading and body/text role to the verified demo families, including the required weight, style, stretch/width axis, line height, and letter spacing.
- Prove the live desktop and mobile computed heading/body font families match the demo. A visually similar fallback or the previous site’s heading family is a failure.
- Do not redesign, simplify, omit, approximate, or add original styling.
- Keep the approved global header/footer outside the isolated body host unless replacement is explicitly requested.
- Put the copied page body under a dedicated host and scoped reset so legacy site CSS cannot contribute undeclared typography, color, decoration, spacing, borders, dimensions, or responsive behavior.
- Replay the demo’s universal baseline under the same scope after any `all: revert` reset.
- Preserve Tina fields and `data-tina-field`; replace only visible demo values with dynamic bindings.
- Compare source and implementation at desktop, tablet/source breakpoints, and phone widths using screenshots plus computed-style/geometry checks.

### 2. Keep visible output Tina-driven

- No hardcoded titles, descriptions, people, bylines, biographies, categories, menus, logos, contact details, SEO values, article cards, archive lists, or sitemap entries.
- Tina Cloud/backend values drive public output. Repository content is fallback only and must never silently override a saved Cloud value.
- Public and editable loaders are separate contracts: editable loaders must return the real query, variables, authoritative data, `data-tina-form`, and exactly one intended `data-tina-primary` form.
- Dynamic archives, users, categories, sitemap, navigation, global chrome, and 404 helpers must derive from collections rather than duplicated code arrays.

### 3. Enforce destination identity neutrality

The reusable source and each independent clone must not inherit the source publication’s:

- Tina client/project ID, content endpoint, repository, or branch;
- domain, canonical URL, or analytics identity;
- Cloudinary folder or API key/secret pair;
- Formspree endpoint;
- logo, favicon, authors, navigation filenames, brand copy, screenshots, or customer assets;
- generated admin identity, workstation paths, tokens, backup files, or deployment archives.

Missing destination identity must fail validation. It must never fall back to the boilerplate project. Audit the entire tracked tree, not only new diff lines. A blank logo must render a neutral configured wordmark, not a legacy image fallback.

### 4. Make runtime environment authoritative

- Resolve `.env` relative to the startup module/application root, never the process working directory.
- Prefer the first explicit environment file in this order: `SITE_ENV_FILE`, application-root `.env`, then current-directory `.env` only when intentionally supported.
- Explicit destination values must override stale Passenger-inherited values.
- Validate runtime site URL, Tina client ID, branch, repository, content endpoint, Cloudinary folder, and Formspree configuration as one destination identity contract.
- Keep production `.env` outside release archives, ignored by Git, and mode `0600`.

### 5. Query the verified Tina destination first

#### 5.0 Verify every provided destination resource before declaring anything missing

- **Do not assume from the default account, organization, repository, key, or token shown after login.** Enumerate the organizations available to the supplied Tina account and deliberately select the organization that owns the destination project.
- For Bliss Drive publisher migrations, check **`bliss-tinacms's Organization` first**, not `Bliss Drive's Organization`. The `Bliss Drive` login may be an Admin collaborator while the project is owned by the `bliss-tinacms` organization. An empty project list in `Bliss Drive's Organization` does **not** prove that the supplied account has no projects.
- For `heraldnewstoday`, explicitly select **`bliss-tinacms's Organization`** and verify the existing **`heraldnewstoday`** project before making any project-access conclusion.
- Double-check the supplied Tina login, selected organization, project name/client ID, connected GitHub account and repository, branch, API keys, content token, Cloudinary credentials/folder, Formspree endpoint, cPanel account/domain, and deployment paths against the provided tracker, secret store, repository environment, and live service UI. Compare secret values with masked fingerprints or equality checks; never print them.
- A login landing in the wrong organization, one failed request, an empty default view, or a missing local credential helper is not evidence that the resource was not provided. Search all approved provided sources and switch to the verified owner organization before reporting `BLOCKED`.
- Never create a replacement account, project, repository, API key, token, form, media folder, or deployment target merely because the first/default selection is empty. Use the provided resources and verify their identity and permissions first.
- Record positive evidence for each identity contract: exact organization, project/client ID, connected repository, branch, and successful authorized query. If evidence conflicts, stop and reconcile it instead of guessing.

- Construct the direct Tina content endpoint from the verified destination client ID and branch.
- For server-side/public reads, prioritize that verified endpoint ahead of inherited `TINA_UPSTREAM_CONTENT_API_URL` or `TINA_DIRECT_CONTENT_API_URL` values.
- Require returned Global Config/site identity to match the destination before Cloud data can override repository fallback.
- Treat authentication and project authorization as separate checks: successful login does not prove project/branch access.
- A same-origin content proxy is transport only. It may forward requests and auth headers but must not inject the server token for anonymous requests, strip fields, rewrite mutations, coerce rich text/references, merge local frontmatter, persist overrides, or synthesize success.

### 6. Treat schema changes as migrations

Every schema/model change requires one synchronized change set:

- collection definitions;
- handwritten queries/loaders;
- content documents;
- `tina/tina-lock.json`;
- required generated types/schema artifacts;
- tests and fullcheck fixtures.

Then run generation, sanitize generated clients, commit/push, wait for Tina Cloud indexing, inspect direct GraphQL field/cardinality parity, and run the normal cloud-checked build. Field renames should be additive first; remove legacy fields only in a separately verified migration.

### 7. Preserve collection-driven relationships and MULTICAT-LOCK

- Blog authors reference User records; name, avatar, biography, URL, byline, and author box resolve from the same selected record.
- Header/footer roles reference Navigation documents through Global Config; runtime code must not depend on fixed filenames.
- Category choices come from the authenticated paginated Category collection, never a source-code list.
- If native multi-reference lists fail the active Tina version, store a string list and use a tested custom field that saves canonical `_sys.path`, preserves unavailable selections, supports refresh, and calls `input.onChange`.
- **A demo in which one demo record shows one category is only one data instance. It never authorizes singular schema, `primaryCategory`, first-item-only rendering, exclusion of `Featured`, or any other reduction of a multi-category array.** Preserve the demo badge design by repeating it once for every selected category.
- Every selected category must render publicly as its own visible, linked badge with the correct archive URL. No selected category may be hidden merely because another category is considered primary, editorial, featured, or visually preferred.
- Keep a committed fixture with at least two categories. `TINA-FULLCHECK` must query that complete backend array and compare it with the dedicated public article-category DOM: exact count, ordered normalized labels, slugs, and archive links. Whole-page text searches and category-archive counts do not satisfy this gate.
- The source validator must fail on singular-selection patterns such as `primaryCategory`, category-array `.find(...)`, or first-item-only article-header rendering, and must fail if the executable fullcheck loses its two-category cardinality assertion.
- Open a post with at least two categories, prove all remain selected, change the category set in the live admin, save, query authenticated Tina, verify every selected category on the public article frontend, then restore the exact original array and prove backend/admin/public restoration. Never reduce an existing array to one category.

### 8. Preserve rich-text fidelity

The renderer and migration adapter must support and test paragraphs, headings, bold/italic text, links, escaped characters, ordered/unordered lists, embeds, and inline Cloudinary images. Verify one real article through authenticated edit, public rendering at the exact media URL, exact document restoration, and media cleanup.

### 9. Isolate external services per site

Each independent publication requires its own repository, Tina project/branch, canonical origin, Cloudinary root folder, and Formspree form. Prefer a named per-site Cloudinary key even when the account is shared.

- Cloudinary proof: authenticated list plus reversible signed upload/public fetch/delete.
- Formspree proof: read the live DOM action and POST to that exact endpoint only when authorized; require `200 {"ok":true}`.
- A login page, console access, unauthenticated `401`, or configured string alone is not integration proof.

### 10. Keep public email addresses ordinary

Public emails must remain readable text and normal `mailto:` links. Reject `[email protected]`, exact `data-cfemail` attributes, `/cdn-cgi/l/email-protection`, or generated decoder markup. Use response-level `Cache-Control: no-transform` and an email-protection fence when required, then verify cache-busted raw CDN HTML and hydrated DOM on every affected route.

### 11. Build and deploy one immutable release

- Install from the tracked lockfile with a frozen install.
- Run source/runtime validators, local Tina diagnostics, Astro diagnostics, secret/path scans, referenced-asset checks, and `git diff --check`.
- Capture the full release SHA with `git rev-parse HEAD`; never reconstruct it from a short SHA.
- Build a secret-free archive and reopen it before upload.
- Replace the application tree cleanly rather than extracting over the old tree; overlay extraction can retain deleted routes and stale assets.
- Deploy server output, client assets, `public/admin/`, content, startup/package files, and the release marker as one synchronized set. Keep `.env` separate.
- Restart only the target application using a verified Passenger recycle/app-group method. A touched restart marker alone is not proof.
- Require exact equality among local `HEAD`, remote branch, cloud-built candidate, archive marker, and production `RELEASE_COMMIT`.
- Keep and integrity-test a rollback archive before cutover.

### 12. Protect concurrent Tina commits

Immediately before push, fetch the Tina-connected branch, inspect remote-only commits, and rebase the verified candidate above legitimate editor changes. Preserve neutral-safe content and reject source identity leakage. Never force-push over Tina-generated commits. Rerun sanitization, validation, secret scans, and clean-tree checks after rebase.

### 13. Run executable TINA-FULLCHECK and PUBLISHER-ADMIN-GATE

**Mandatory regression ID: `AUTHOR-ISLAND-EDITABILITY-001`.** This ID belongs
to TINA-MIGRATION-GOLD, TINA-FULLCHECK, and PUBLISHER-ADMIN-GATE. Every future
release must prove that the canonical `/author/<slug>/` route owns a primary
`author` Tina island and that a preview POST to
`/tina-island/author?slug=<slug>` returns an authoritative `user` form with
`query_len > 100`, `variables.relativePath == "<slug>.json"`, user data, and
exactly one primary marker. HTTP 200, visible preview content, public
backend-to-SSR parity, or the mere presence of `data-tina-island` cannot pass
this ID. PUBLISHER-ADMIN-GATE must additionally open that exact author in the
live visual editor, wait for real User fields, save a temporary visible marker,
prove authenticated backend and cache-busted public reflection, restore the
exact original through the UI, and prove backend/public restoration and marker
absence. Record the ID with PASS, FAIL, or BLOCKED evidence; never omit it from
a migration report.

**Mandatory regression ID: `EMPTY-POST-LIST-001` under `ASTRO-DEMO-LOCK`.**
Every category, blog index, author archive, or equivalent post-list surface must
render the shared, accessible copy **“No published posts yet.”** exactly once
when its published-post array is empty. It must never leave a blank content
region, render an empty lead/grid wrapper, or show the empty message when at
least one published post exists. This behavior belongs in the reusable
boilerplate archive components rather than a one-off route condition, and its
spacing/typography remain part of ASTRO-DEMO-LOCK. `TINA-FULLCHECK` must derive
a real zero-post category from the Tina Category and Blog collections, verify
the marked empty state and exact copy on that live archive (preferring
`/world-news/` when it is empty), and verify a non-empty control archive does
not contain the marker. If no zero-post fixture exists, the gate is `BLOCKED`;
it must not silently skip the assertion.

Coverage must be derived from the configured Tina collection set and equal the explicit test map. For every configured collection—normally Blog, Page, Category, User, Navigation, and Global Config—use the real live Publisher admin account and run:

1. open the exact document and wait for its real fields;
2. capture the complete original value/document;
3. make a safe visible marker edit and save through the Tina UI;
4. prove the authenticated Tina backend contains the marker;
5. prove the unique mapped public DOM/meta location reflects it with cache bypass;
6. restore the exact original through the admin;
7. prove authenticated backend restoration;
8. prove cache-busted public restoration and marker absence.

Also test editable SEO title/description/canonical/robots/Open Graph/Twitter/JSON-LD as applicable; one Page and one Blog article; `MULTICAT-LOCK`; author resolution; Navigation; header/footer logos; rich-text image upload; Cloudinary; and Formspree when authorized. Restoration outranks starting another test. Any incomplete login, save, public mapping, cleanup, or restoration is `BLOCKED`, not done.

### 14. Verify routes, metadata, assets, and visuals

After deployment verify:

- home, standard pages, blog index, article, category, author, sitemap, RSS, contact, `/admin/`, and an intentional 404;
- every referenced hashed asset returns `200` with the expected content type;
- canonical, Open Graph, Twitter, RSS, and sitemap origins are the public HTTPS origin, never localhost;
- no console errors, failed requests, broken images, horizontal overflow, clipped text, or duplicated global sections;
- exact-demo screenshot and computed-style parity at desktop/mobile and every supplied breakpoint;
- readable public emails with no Cloudflare protection artifacts.

### 15. Keep source-ready and live-ready reporting separate

Report every gate as `PASS`, `FAIL`, or `BLOCKED`, with evidence. Do not call the source or migration stable while a required gate is blocked. A source-ready commit can be reported while push, Cloud indexing, deployment, or live admin verification remain pending, but it must not be described as cloud/live accepted.

## Migration-speed and finalization requirements

The following requirements were added from the New Media Xpress migration. They make repeated migrations faster by eliminating avoidable rebuilds, stale assumptions, manual evidence reconstruction, and repeated mutation cycles. They do not weaken any acceptance gate.

### 16. Split mutable acceptance from the immutable release

- Run every authenticated save → backend → public → exact restore transaction during a clearly named **mutable acceptance stage**.
- Record a content baseline before the first live mutation. At minimum, record document paths, complete hashes, tested field paths and values, relationship selections, referenced media, and temporary markers.
- Maintain a transaction journal for every temporary test: document, field, original value, marker, save evidence, public selector/meta location, restoration evidence, and cleanup state.
- Restoration must be proved by authenticated Tina data, cache-busted public output, marker absence, and baseline equality.
- After all mutation tests pass, declare a **mutation cutoff**. Fetch and inspect Tina-generated commits, reconcile the branch without force-pushing, verify baseline restoration, and only then create the immutable production build.
- After immutable deployment, run an authenticated **read-only** admin acceptance: correct project/branch, collections, restored fields, Save controls, no schema warning, non-empty sidebar, and exactly one intended primary form. Do not save again unless a failure explicitly reopens the mutable cycle.

### 17. Standardize environment and destination resolution

- Every Node, Python, Tina, Astro, build, verification, and deploy script must use one shared resolver for site identity and Tina variables.
- Resolve the client ID in this order: `NEXT_PUBLIC_TINA_CLIENT_ID`, then `TINA_CLIENT_ID`, otherwise fail.
- Resolve the branch in this order: `NEXT_PUBLIC_TINA_BRANCH`, `TINA_BRANCH`, `GITHUB_CONTENT_BRANCH`, then an explicitly documented default such as `main`.
- Resolve and validate the destination site URL, repository, Tina project, branch, Cloudinary root, Formspree identity, app root, and public root once; pass the normalized result to all later tools.
- Logs may report only configured/missing state and non-secret identifiers that are safe for the release report. Never print tokens, passwords, API secrets, authenticated request bodies, or tracker secret cells.

### 18. Preflight external access before expensive work

Before implementation or a production build:

- verify the Git remote and the intended non-interactive write path;
- verify Tina authentication, project authorization, connected repository, branch, read-token access, index state, and returned publication identity separately;
- verify Cloudinary and Formspree destination identity without sending an unauthorized live submission;
- discover cPanel capabilities for upload, list, read, mkdir, extract, unlink, chmod, cron add/list/remove, Passenger inspection, and restart;
- verify Publisher credentials can reach the actual Tina login without printing or persisting them outside protected temporary state.

Prepare a temporary secret-backed `GIT_ASKPASS` or equivalent only when needed, protect it with mode `0600`, never embed credentials in a remote URL, and remove it in a guaranteed cleanup path.

### 19. Classify Tina Cloud/index failures and retry only transient states

- Distinguish branch-not-found-before-first-push, indexing pending, stale schema, wrong project/repository, unauthorized token, proxy HTML returned to a Cloud status request, GraphQL field/cardinality mismatch, and network/transient errors.
- Retry only indexing and network/transient states with bounded exponential backoff.
- Fail immediately on wrong identity, `401`, `403`, actual schema mismatch, invalid GraphQL, destructive compatibility behavior, or an unexpected repository/branch.
- Run direct Tina Cloud schema/status checks before generating the production admin that uses a same-origin proxy.
- Sanitize generated Tina files in a `finally` path after every Tina command, including failed commands.

### 20. Generate collection-complete coverage mechanically

- Derive the configured collection set from the exported Tina collection definitions and require exact equality with the fullcheck map.
- Keep a versioned reflection map for every collection and tested template: fixture document, public route, backend field path, exact public selector or metadata location, expected transformation, and restoration rule.
- A schema or template-field rename must update the schema, content, handwritten queries, lock, generated artifacts, reflection map, and tests in the same migration.
- Add a negative omission test that introduces a temporary probe collection and proves the coverage guard fails.
- Never embed outdated field-name assumptions directly in one-off verification scripts.

### 21. Make route and content-source ownership observable

- Inventory every authoritative fixture against its live route, owning Astro route, template, Tina island, collection, and verification selector before implementation.
- Test `/`, representative page/article/category/author routes, policy pages, sitemap, RSS, `/admin/`, a non-existent route, and the 404 template.
- Confirm which route owns `/`; never assume `index.astro` wins over a catch-all route.
- Loaders should expose a non-secret test diagnostic identifying `tina-cloud` versus `local-fallback`. Fallback may preserve availability but cannot pass cloud/live acceptance.
- A fresh preview or Passenger process must expose the source/release SHA used to render it so a stale server cannot be mistaken for current output.

### 22. Capture exact-demo evidence once and reuse it

For supplied demos or bundled HTML:

- capture authoritative desktop, phone, and every supplied breakpoint screenshot before changing the implementation;
- extract and inventory DOM, CSS, assets, fonts, internal font metadata, font weight/width axes, viewport, device-pixel ratio, computed styles, and key section geometry;
- treat captured PNGs as visual authority when replayed HTML depends on dead `blob:` URLs or missing runtime resets;
- maintain a complete fixture-to-route/template map covering homepage, generic page, special pages, archives, article, policies, sitemap, 404, header, footer, and shared CTA;
- generate labeled reference/current/difference images and measured geometry/computed-style reports automatically;
- verify the listening PID, working directory, process start time, and build SHA before accepting local screenshots.

### 23. Enforce CSS containment and typography mechanically

Automated visual guards must check:

- the dedicated demo host/reset is present and legacy CSS does not supply undeclared body properties;
- universal box-sizing, margin, padding, and required baseline declarations are replayed after scoped `all: revert`;
- global header/footer boundaries remain as approved;
- there is no nested main, duplicated global section, broken image, clipped text, or horizontal overflow;
- actual font binaries, family names, load state, weights, variable width/stretch axes, line heights, colors, and responsive geometry match the reference.

### 24. Build one immutable candidate and prove its identity

The finalization sequence must:

1. fetch the connected branch and classify all remote-only Tina commits;
2. verify temporary markers are absent and restored content equals the recorded baseline;
3. reconcile without force-pushing and rerun sanitization/validation after any rebase;
4. require a clean worktree and `HEAD == origin/<branch>`;
5. run direct Cloud schema checks, normal cloud build, Astro diagnostics, dynamic-reflection guards, route/assets/SEO/sitemap checks, visual checks, and secret scans;
6. run independent read-only gates in parallel after the build;
7. package only after every pre-package gate passes;
8. write the full `git rev-parse HEAD` value to `RELEASE_COMMIT`;
9. reopen the archive, verify its type, contents, byte size, SHA-256, marker, and absence of `.env`, secrets, machine paths, temporary files, source maps, `.git`, and unrelated build artifacts;
10. generate machine-readable and human-readable release manifests.

The release must fail unless local `HEAD`, remote branch, archive marker, cloud-built candidate, and production `RELEASE_COMMIT` are identical.

### 25. Use a capability-selected, fail-closed deployment

- Select the deployment method from the preflight capability matrix. Prefer direct shell/task execution, then direct API file operations, and use one-shot cron only as a bounded fallback.
- Prefer documented API2 `Fileman` operations such as `mkdir`, `fileop=extract`, `fileop=unlink`, `fileop=chmod`, and `fileop=copy` when equivalent UAPI functions are unavailable.
- Never assume a named cPanel endpoint exists; probe it before the release window.
- Use one reusable, versioned remote release script or manifest-driven command rather than rebuilding a large shell expression for every site.
- The remote release must lock, validate a regular archive, verify its checksum, create and test a rollback, preserve only the approved server-owned paths, remove the old payload, extract cleanly, verify `RELEASE_COMMIT`, restore `.env` to `0600`, restart only the target Passenger app, and emit a structured result.
- Cron fallback commands must reject unescaped `%`, omit no fail-fast checks, use a unique operation ID, and always remove the owned cron after completion or failure.
- Acceptance requires zero migration-owned cron jobs and no stale upload, marker, log, lock, authentication state, helper script, or release staging directory.
- Retain the newest verified rollback according to policy; remove obsolete migration-owned artifacts only after acceptance.

### 26. Keep a pinned browser acceptance harness

- Maintain a pinned, reusable Playwright environment rather than installing ad hoc browser tooling during each migration.
- The login helper must handle the Tina `app.tina.io` popup/page/frame flow, return to the original admin, wait for a concrete collection field, verify the intended breadcrumb/form, and protect then delete browser storage state.
- Every mutation test is atomic: capture → edit → save → backend proof → public proof → restore → backend restoration → public restoration → marker absence.
- Choose a test field only after mapping it to one unique public selector or metadata location; administrative or masked values are not valid reflection fixtures.
- If time, tool, or context limits approach, restoration and cleanup outrank starting another test.

### 27. Parallelize only independent verification

After the immutable build, run independent read-only jobs concurrently where supported:

- Git/branch parity;
- Tina collection and dynamic-reflection checks;
- route, redirect, asset, RSS, sitemap, and metadata checks;
- secret/machine-path scans;
- visual screenshot/computed-style checks;
- archive inspection.

Keep dependent work serial: fetch/reconcile → build → package → upload → activate → production verification → cleanup. Parallel workers must finish before final generated-file sanitization, staging, packaging, or acceptance.

### 28. Provide one finalization command and one evidence report

The repository should expose or progressively implement a single fail-closed finalization entry point, for example `pnpm migration:finalize`, that performs the applicable Steps 16–27 and stops before any unauthorized external side effect. It must produce:

- `migration-report.json` for machine checks;
- `migration-report.md` for the release handoff;
- source, remote, archive, and production SHA equality;
- archive SHA-256 and byte size;
- per-collection Publisher transactions;
- baseline/restoration result;
- route/assets/SEO/visual results;
- integration results;
- rollback location/integrity;
- remaining temporary artifacts and migration-owned cron count;
- `PASS`, `FAIL`, or `BLOCKED` for every gate.

A green summary is invalid if its own coverage map, negative tests, or final parity assertion did not run.

### 29. Negative-test the guards

The validation suite must prove that it fails when at least one of the following is introduced in a disposable copy:

- an omitted collection;
- a hardcoded category/user/navigation option;
- local-first public content authority;
- a generated token or machine path;
- inherited source domain/service identity;
- missing or stale `tina-lock.json` coverage;
- mismatched `RELEASE_COMMIT`;
- a remaining migration-owned cron;
- a Cloudflare-protected public email;
- a temporary live-admin marker that was not restored;
- an unsafe proxy that gives anonymous requests server-token authority.

### 30. Autonomous execution and limit-safe continuation

- Execute all clearly authorized, in-scope, non-destructive migration steps autonomously. Batch independent read-only checks, choose safe defaults, and do not pause merely to ask whether to continue.
- Automatically continue from one completed gate to the next until the requested migration is complete, blocked by missing access, or would require an unapproved destructive/external side effect.
- No agent may approve its own platform, security, billing, credential, or hosting authorization prompt. “Auto allow” means avoiding unnecessary confirmation requests and using already granted access; it does not bypass mandatory permission controls or expand the user-approved scope.
- Before approaching a tool, context, or execution cap such as `150/150`, persist a secret-free checkpoint containing the current SHA, completed gates, active transaction cleanup state, exact remaining steps, and relevant artifact paths.
- If the runtime supports automatic continuation, resume from that checkpoint without asking the user to type `continue`. If the platform terminates the run or requires a new user turn, do not claim that the limit was bypassed; restore/cleanup first when possible and leave a deterministic continuation checkpoint.
- On resume, re-read live Git, process, server, and admin state before acting. Never assume a stale checkpoint proves current state, and never repeat an already completed mutation test unless current evidence requires reopening it.

## Required validator coverage

The repository validator must reject at minimum:

- source brands, domains, people, service IDs, and customer assets in runtime source;
- tracked `.env`, filled manifests, secrets, generated tokens, machine paths, backups, and generated cross-site admin bundles;
- missing package lock or `tina/tina-lock.json`;
- hardcoded category options, users, navigation filenames, and visible fallback content;
- a content proxy that rewrites typed Tina data or elevates anonymous requests;
- malformed/non-origin `SITE_URL` and localhost production metadata;
- non-unique Cloudinary root folders and inherited Formspree endpoints;
- missing release/fullcheck commands and this process document.

## Required command sequence

### Neutral source candidate

```sh
pnpm install --frozen-lockfile
pnpm validate:starter
pnpm build:local
pnpm astro check
git diff --check
```

### Provisioned destination candidate

```sh
pnpm site:provision -- --manifest site.manifest.json
pnpm validate:site
pnpm build:local
pnpm astro check
```

Push the destination branch only after the source gates pass. Wait for Tina Cloud indexing, then run:

```sh
pnpm build
pnpm tina:fullcheck
```

`pnpm tina:fullcheck` is not complete until its authenticated live-admin save/public/restore companion gate has passed for every configured collection.

## Final release record

Record, without exposing secrets:

- protected baseline tag;
- candidate full SHA;
- remote branch SHA;
- deployed `RELEASE_COMMIT`;
- Tina project/repository/branch equality;
- source validation and cloud-build results;
- per-collection Publisher gate results;
- MULTICAT, SEO, rich-text/media, Cloudinary, and Formspree results;
- route/asset/metadata/browser results;
- rollback archive integrity;
- temporary marker/upload cleanup and exact restoration.
