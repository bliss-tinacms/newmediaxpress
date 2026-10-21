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

> **NON-NEGOTIABLE PROVIDED-RESOURCE RULE:** The user-provided account, organization, repository, branch, API keys, tokens, client ID, credentials, and deployment details are authoritative inputs. Check and use those exact supplied resources. Never assume, infer, substitute, create, rotate, or borrow a value from another account or project. For `heraldnewstoday`, check **`bliss-tinacms’s Organization`**, where the project lives—**not `Bliss Drive’s Organization`**. Verify every value independently and stop on any mismatch instead of guessing.

- **Do not assume from the default account, organization, repository, key, or token shown after login.** Enumerate the organizations available to the supplied Tina account and deliberately select the organization that owns the destination project.
- For Bliss Drive publisher migrations, check **`bliss-tinacms’s Organization` instead of `Bliss Drive’s Organization`**. The `Bliss Drive` login may be an Admin collaborator while the project is owned by the `bliss-tinacms` organization. An empty project list in `Bliss Drive’s Organization` does **not** prove that the supplied account has no projects.
- For `heraldnewstoday`, explicitly select **`bliss-tinacms’s Organization`**, where the project lives, and verify the existing **`heraldnewstoday`** project before making any project-access conclusion.
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

### 31. FAILURE-DERIVED EXECUTION GATES — prevention must be executable

These gates permanently encode failures discovered during real migrations. They are mandatory on every migration. A verbal promise, retrospective, local-only result, generic HTTP sweep, or unchecked box cannot satisfy them.

1. **NO-PREMATURE-COMPLETION.** Never present a local build, local screenshot, archive, upload, extraction, restart request, release marker, or generic HTTP `200` as the deliverable. Completion requires the final immutable production SHA, live route/asset checks, exact demo gate where applicable, authenticated admin evidence, real island traffic, rollback proof, SHA parity, and cleanup. Progress reports must say `INTERMEDIATE`, not imply completion.
2. **AUTHORITY-FIRST.** Before implementation, name and hash the one authoritative source set. Reject unrelated designs and inherited themes. If source is missing or contradictory, stop `BLOCKED`; never approximate, redesign, normalize, or encode the current destination as the expected result.
3. **GATE-SELF-TEST.** A validator is not trusted until controlled negative tests prove it rejects one expected violation per template family and shared structural area. Each mutation must fail for its intended invariant, not an unrelated browser, route, or resource error. A release accepted by an older weak gate must be treated as unverified until rerun through the hardened gate.
4. **PRODUCTION-DATA-SHAPE.** Required DOM wrappers and visual structure must sit outside representation-specific branches. Test rich-text objects, strings, absent optional blocks, and fallbacks with destination Tina Cloud data. Local fixtures/local mode alone cannot certify production structure.
5. **DESTINATION-ENV-ONLY.** Start build, preview, SSR, admin, and validation from a clean child environment; explicitly load the approved destination env; verify client ID/branch/origin before launch; and fail if required values are absent. Inherited Tina endpoints/tokens and unrelated project values must never win. Do not start a validation server without this preflight.
6. **FRESH-PROCESS-AND-SHUTDOWN.** Never validate through a process that survived a rebuild. Prove listener PID/cwd and a release-specific selector, close browser contexts and in-flight requests before termination, then stop the workspace-owned server. Label expected `SIGTERM`/shutdown connection errors as local-only and immediately run a live health probe so shutdown noise cannot be mistaken for production failure.
7. **SERIAL-BROWSER-GATES.** Run the full positive visual/DOM/interaction suite, controlled-negative suite, and authenticated admin suite serially. Parallel Chromium trees on constrained hosts are forbidden. Preserve each parsed result and exit code before starting the next suite.
8. **RESOURCE-PREFLIGHT.** Before browser-heavy work, builds, or release packaging, measure `/`, `/tmp`, `/dev/shm`, memory, and stale browser processes. Enforce a project-defined free-space floor; clean only known disposable caches/artifacts; retain required browser binaries; then re-measure. Resource exhaustion is an infrastructure failure, never evidence that the site passed or failed its design gate.
9. **DETERMINISTIC-TOOLCHAIN.** A clean build environment must use explicit verified Node/package-manager paths rather than interactive/login-shell initialization. Record tool versions. `command not found` is a failed preflight and must be corrected before any build claim.
10. **AUTHENTICATED-GIT-PREFLIGHT.** Before the release sequence, verify remote, branch, fetch and push authorization without printing or persisting credentials in the remote URL. Keep push as a standalone operation. A local commit is not remote release evidence.
11. **PUBLISHER-BEFORE-FINAL-SHA.** Run the mutating Publisher save → authenticated backend → unique public reflection → exact restore gate before the final immutable build. Fetch the restoration commits, inspect equality, rebase/fast-forward, rebuild and deploy that exact final tip. After cutover, use read-only admin proof; do not create an infinite mutation/redeploy loop.
12. **PROJECT-SECRET-MAP.** Check the approved project-specific secret/tracker location before searching conversation history or broad databases. Maintain a secret-safe ledger of variable names and protected source paths, never values. Do not ask again for securely available inputs.
13. **CPANEL-ENDPOINT-NORMALIZATION.** Normalize stored cPanel hosts exactly once: detect protocol and existing port before adding `2083`, validate the final URL, and never construct duplicate-port endpoints.
14. **CPANEL-RESPONSE-NORMALIZATION.** Inspect API response types and normalize both arrays and objects keyed by application name before iteration. Never guess the Passenger app root or document root from a similar folder name.
15. **TRUE-ORIGIN-PROOF.** A public DNS address behind Cloudflare is not the origin. Obtain the authoritative origin/vhost mapping from hosting inventory before `--resolve`; separately prove apex and `www` with TLS SNI. CDN checks and private cPanel release markers are complementary, not interchangeable.
16. **AUTHENTICATED-ISLAND-POST.** Tina island acceptance requires real authenticated browser/preview traffic or an equivalent correct `POST`: status `200`, non-empty response, non-empty query, meaningful variables, expected data key, form metadata, and exactly one intended primary form. Anonymous `GET`, expected `405`, shell visibility, or an empty HTTP-200 form is not proof.
17. **CANONICAL-ADMIN-LOGIN.** Authenticate through canonical `/admin/` before adding cache-busting parameters or hash routes. Capture Tina Cloud popups, return to the original context, wait for a concrete collection field, and preserve one browser context through verification. A preview shell or redirect is not an authenticated collection pass.
18. **SELF-CONTAINED-RUNTIME.** Prefer a production-only dependency tree owned by each release or a verified shared runtime. If a new release links `node_modules` from a previous physical release, record that dependency edge, verify the symlink, and forbid cleanup of that release. Never mislabel a runtime dependency as disposable rollback history.
19. **RETENTION-CLEANUP.** Final acceptance must leave one active release, one explicitly approved rollback/runtime dependency, no uploaded archive, no extraction directory, no deploy lock/log marker, no obsolete rollback links, no public ZIP, no temporary diagnostics, and zero owned one-shot cron jobs. Re-run live health after cleanup.
20. **STRUCTURED-EVIDENCE.** Use structured readers/parsers and machine-readable gate output. Do not base acceptance on truncated terminal display, copied line-number output, or unparsed logs. Preserve command exit codes and sanitize evidence before reporting.
21. **EVIDENCE-ARTIFACT.** Every Publisher/admin transaction must write a sanitized result containing target, timestamp, final commit, collection/document, original-value hash, marker observation, authenticated backend reflection, unique public selector/meta reflection, exact restoration hash, marker absence, and unrelated-content drift result. Parse and retain this artifact immediately.
22. **CHECKPOINT-NOT-COMPLETION.** Treat build, upload, extraction, restart, marker, and route-smoke success as checkpoints. The mandatory order is: authority/hash → implementation → Publisher mutation/restore → final branch tip → clean production build/secret scan → fresh local production gate → local negative gate → immutable package/deploy → live fingerprint → full live positive gate → live negative gate → authenticated read-only admin/island proof → exact SHA parity → cleanup → post-cleanup health gate.
23. **MINIMAL-RETRY-DIAGNOSTICS.** When a probe fails because the method, URL shape, shell path, auth transport, resource state, or API response shape was wrong, classify and correct the harness first. Never weaken product assertions, lower visual thresholds, or change site code merely to make a malformed diagnostic pass.
24. **LITERAL-VISUAL-NON-APPROXIMATION.** When a supplied demo is authoritative, preserve its exact DOM/classes, CSS declarations, fonts and font binaries/axes, colours, dimensions, spacing, imagery, states, breakpoints and interactions. “Close enough,” a redesigned equivalent, a cleaned-up hierarchy, a similar inherited component, or subjective visual approval is failure. Tina may change values; it may not change the locked wrappers and presentation around those values.
25. **SHA-HTTP-NOT-VISUAL-PROOF.** Matching local/remote/deployed SHAs, a valid `RELEASE_COMMIT`, HTTP `200`, successful build, or healthy process proves identity/availability only. It never certifies visual, structural, responsive, sticky, admin, or dynamic-data parity. Those require their own DOM, computed-style, geometry, screenshot, interaction, and authenticated data gates.
26. **CLOUD-SOURCE-PRECEDENCE.** Run the exact lock against destination Tina Cloud/production-shaped records, not only local MDX or static fixtures. For every template whose Cloud representation differs, assert which source wins for each field and require the authoritative body/hierarchy to survive rich-text object, string, absent and fallback shapes. An editorial body or wrapper that changes only in Cloud mode is a release blocker.
27. **REAL-WHEEL-STICKY-PROOF.** A computed `position: sticky` declaration and top offset are necessary but insufficient. Use real wheel input, wait until scroll position and element geometry settle, prove the rail pins at the source-derived offset over multiple wheel steps, and prove the correct release behavior at the containing boundary when practical. Smooth `scrollTo` measurements taken in motion do not count.
28. **RESPONSIVE-RAIL-TOC-CONTRACT.** Independently lock desktop and compact article behavior. Desktop must preserve the source rail width, card/TOC hierarchy, sticky offset and visibility; compact/mobile must hide the wide rail and expose the intended in-article TOC as static/non-sticky. Test both sides of the source breakpoint so a desktop fix cannot silently break mobile or vice versa.
29. **COMPLETE-TEMPLATE-FAMILY-MATRIX.** Inventory every authoritative family and shared structural area before implementation: home sections, archives, article, generic/editorial page, contact, sitemap, catch-all/404, CTA, header/footer and any supplied specialty template. Each family needs a route/component mapping, DOM contract, desktop/mobile checks and at least one controlled mutation. Testing only user-highlighted screenshots is incomplete.
30. **FIXTURE-INTEGRITY-FIRST.** Store the authoritative fixture corpus separately from implementation output with a checked SHA-256 manifest that excludes itself. Require unique normalized manifest paths and reject duplicate entries before hashing. Reject symlinked authority roots, manifests, fixture files or directories; require segment-safe lexical containment plus realpath containment inside the authority root. Enumerate the complete fixture tree and reject every unmanifested file. Verify every expected path/hash before starting a browser or deriving assertions. A changed, missing, extra, escaped, symlinked or implementation-generated “authority” fixture fails closed; never silently refresh fixtures from the destination under test.
31. **DUAL-ARTIFACT-SECRET-SCAN.** After the final credentialed Tina command and sanitization, scan both the completed `dist/` tree and the exact final release archive for protected token/password/secret values, generated client credentials, machine paths and accidental `.env` inclusion. A clean source tree or clean `dist/` alone is insufficient. Report key names/counts only, never values.
32. **EXACT-SHA-PACKAGE-POINTER-PARITY.** Build the archive from `git archive <full HEAD>` plus only the verified generated runtime payload, write that exact full SHA to `RELEASE_COMMIT`, reopen and verify the archive before upload, and require equality among local HEAD, remote branch tip, archive marker, physical release marker and active production pointer after cutover. Upload/extraction success or a guessed/expanded short SHA cannot pass.
33. **FINAL-POST-CLEANUP-ACCEPTANCE.** After artifact, stale-release/link and owned-cron cleanup, rerun route/asset health, release-pointer/rollback/runtime-dependency checks, canonical admin shell and the required read-only live lock evidence. Cleanup is part of release acceptance and may not invalidate the active runtime, rollback or evidence. The last report must be based on this post-cleanup state, not a pre-cleanup pass.
34. **EXECUTABLE-LOCK-READINESS.** Policy documents and marker checks cannot pass `ASTRO-DEMO-LOCK` by themselves. Every repository must carry a validator-required executable preflight and controlled-negative preflight. The preflight must verify every lock control, a complete SHA-256 authority manifest with no unmanifested files, a real positive browser validator, a controlled-negative browser suite, and real positive/negative lock commands. Missing source authority or browser gates must emit sanitized machine-readable `BLOCKED` with exit `2`; never generate authority from the destination or point the positive lock command only at policy preflight.

35. **SCOPED-GATE-NOT-ACCEPTANCE.** `PUBLISHER_GATE_COLLECTIONS` is diagnostic-only. A scoped run must emit `PUBLISHER_ADMIN_GATE_SCOPED`, never `PUBLISHER_ADMIN_GATE_OK`, reject every unknown requested case, and cannot satisfy release acceptance. The final gate must derive and execute the complete schema-to-case map.
36. **COMPLETE-DOCUMENT-RESTORATION.** Before every Publisher mutation, snapshot and hash the complete authoritative document. After the UI restore, require byte equality or an explicitly approved normalized semantic hash, marker absence, and no unrelated-field drift. If Tina rewrites serialization, restore the authoritative bytes through the content repository and re-prove backend and public state. A scalar-field comparison is not sufficient.
37. **PRODUCTION-RUNTIME-DEPENDENCY-CLOSURE.** Every module imported by production server or generated admin/runtime output must be in production dependencies. Prove a frozen production-only install, build and start in a clean release environment; development-only availability cannot pass.
38. **RESPONSIVE-NAVIGATION-INTERACTION-CONTRACT.** At 1024px and below the navigation must start closed and expose a real toggle; at 1025px and above it must be desktop-visible with the toggle hidden. Browser gates must prove pointer, Enter, Space, Escape with focus return, link selection, outside click, resize reset, CMS-link presence, ARIA state and no horizontal overflow. A controlled mutation must prove the gate rejects broken ARIA or behavior.
39. **FRONTEND-ROUTE-RESOLUTION.** Tina “View Frontend” routes must resolve in this order: explicit permalink, authoritative `_sys` metadata, form document ID/Tina hash route, then a last-resort title fallback. Preserve root/Home behavior and encoded or nested identifiers. Display titles must never be the default route identity, and the resolver tests are mandatory.
40. **CANONICAL-ALIAS-PARITY.** Maintain a machine-readable alias-to-canonical inventory for migration-emitted URLs. Tests must require the exact redirect status and target and must prove the canonical route itself remains healthy; alias compatibility cannot replace canonical correctness.
41. **DETERMINISTIC-ADMIN-LOCATORS.** Publisher automation must bind each interaction to one configured document and field identity. Mutable visible labels may be used only after proving the expected fixture/index and unique match; ambiguous, stale or zero-match locators fail before mutation.
42. **CATEGORY-ISLAND-EDITABILITY.** Category islands inherit the Author island contract: HTTP success and rendered fallback are insufficient. Require exactly one stable form, a substantial generated query, exact relative-path variables, authoritative collection data and one intended primary form on every canonical/alias route.
43. **REPRESENTATION-SHAPE-MATRIX.** For every Cloud-capable body, execute object-rich-text, repository-string, absent-body and fallback-content cases through the same stable wrapper contract. Require positive DOM/style assertions for each supported shape plus a controlled negative that removes or relocates the wrapper.
44. **MANDATORY-RELEASE-COMMAND-SEQUENCE.** The release sequence must execute, in order, starter/runtime validation, route and alias tests, production build/start, Tina fullcheck, demo-lock preflight, positive demo lock, controlled-negative demo lock, responsive-menu positive and negative gates, the unscoped full Publisher gate, post-Publisher fetch/inspection, exact final-tip rebuild/deploy, read-only live rechecks and post-cleanup acceptance. Validator-enforced command wiring is required; prose-only commands do not pass.

The repository validator must require every named marker above. Applicable rules must also be implemented in the executable build, demo-lock, admin/fullcheck, deploy, and cleanup scripts; documentation presence by itself is not release acceptance.


## LATEST-MIGRATION-INCIDENT-LEDGER — Herald News Today

This is the explicit postmortem required by the latest migration. It is not a substitute for the controls above: it records **what actually went wrong, how it was solved, and how recurrence is prevented**. Every `HNT-*` row is mandatory in both this document and `ASTRO-DEMO-LOCK.md`; removing one must fail repository validation and the controlled-negative policy test.

| ID | Problem encountered | Solution applied | Permanent prevention | Evidence |
|---|---|---|---|---|
| HNT-001 | The Tina login opened the wrong default organization, making the supplied project appear missing and creating a risk of replacing valid resources. | Selected `bliss-tinacms’s Organization`, verified the existing project, client ID, repository, branch, role and token context. | Enumerate organizations and verify every supplied resource independently; never infer absence from a default view or create substitutes. | `97df6be`, `9e09e20`, `c4d971a` |
| HNT-002 | React, React DOM and TinaCMS were classified as development-only although the deployed SSR bundle required them at runtime. | Moved runtime imports to `dependencies` and regenerated the frozen lockfile. | Run a production-only install and isolated target-Node startup against a CMS route before packaging. | `b606ff3` |
| HNT-003 | TINA-FULLCHECK used obsolete `/blog/...` routes, searched raw markup instead of rendered text and treated an image URL as visible text. | Aligned canonical routes, normalized rendered HTML text and decoded image-service URLs before comparison. | Derive checks from the live route map and field rendering semantics; require deliberate negative tests for text, markup and asset fields. | `5d62c19` |
| HNT-004 | Tina’s generated client and `import.meta.env.TINA_TOKEN` allowed a content token to be inlined into the server bundle. | Split Tina generation from Astro compilation, sanitized generated client code first and made server loaders read only `process.env`. | Two-stage credentialed generation → sanitization → token-free Astro build, followed by byte scans. | `c30f0c4` |
| HNT-005 | A hand-written live Page GraphQL fragment no longer matched the schema, so valid Cloud fields could render blank or in the wrong structure. | Replaced the stale fragment with the actual `PageBlocksAboutMockup17` field tree. | Compare every manual query field-for-field with generated schema and verify non-empty live attributes/text after deploy. | `2f48557` |
| HNT-006 | The Publisher restore returned the same meaning but changed quote style and trailing bytes in a tracked MDX fixture. | Restored the fixture byte-for-byte. | Hash the baseline before mutation and require exact file/content hash restoration, marker absence and no unrelated drift. | `1c76788` |
| HNT-007 | The responsive menu breakpoint and open-state CSS disagreed; keyboard, Escape, outside click, link selection and resize behavior were not proven. | Fixed the 1024px contract, open-state CSS and header behavior; added a Playwright interaction matrix. | Test both sides of the breakpoint with pointer and keyboard interactions, ARIA state, focus return, resize reset and overflow assertions. | `7c0aa23` |
| HNT-008 | Early acceptance covered only selected pages and collections, leaving public template families and CMS collection transactions unproven. | Added fullcheck, Publisher admin gate, demo-lock routes and source-aligned implementations, then expanded all public templates. | Inventory every template family and collection before implementation; require a positive and controlled-negative case for each. | `68f3b27`, `ca65df7` |
| HNT-009 | Author and category edit islands were not fully covered and their editable/public data paths could diverge. | Added author/category island queries, fullcheck coverage and Publisher cases. | Require an authenticated island POST and save → backend → public → exact restore proof for every configured collection. | `8eb3a7c` |
| HNT-010 | Cloudinary validation could pass without a destination-unique root folder or without proving the actual authenticated Media Manager path. | Required all four runtime values, a unique root, exact active/rollback env checks and authenticated list plus reversible UI upload/delete. | SDK-only media proof is forbidden; validate deployed and rollback runtime environments and the real editor UI. | `a96a2b6` |
| HNT-011 | The homepage had drifted from the supplied source in DOM, geometry, typography and imagery. | Restored the source-locked homepage structure and CSS. | Authority-first immutable fixtures, same-viewport screenshot/DOM/computed-geometry checks and a homepage negative mutation are mandatory. | `2386fae` |
| HNT-012 | Tina’s “View on site” shortcut could generate the wrong frontend path. | Added a canonical route mapper and executable shortcut-route tests. | Every collection must have deterministic route mapping tests, including normalization and unknown-input failure. | `2386fae` |
| HNT-013 | About, contact and team informational pages used redesigned wrappers, spacing or imagery instead of the supplied templates. | Restored source hierarchy, assets and page-specific geometry. | Lock every informational family independently at desktop/mobile; shared styling may not replace family-specific authority. | `496c9c9` |
| HNT-014 | A legacy article slug no longer reached the canonical article. | Added one explicit, case-normalized alias and tests that reject unrelated aliases. | Inventory old public URLs before cutover and test each approved alias plus canonical non-alias behavior. | `496c9c9` |
| HNT-015 | Contact hero accent text, color, marker, font size and geometry were visually wrong while generic checks still passed. | Corrected the component/CSS and added DOM hashes, exact geometry, fixture hash and screenshot-MAE checks. | Template-specific assertions and a controlled mutation must supplement generic route/heading checks. | `e6a5828` |
| HNT-016 | The article rail declared `position: sticky` but real sticky behavior and its desktop/mobile contract were not reliably proven. | Corrected rail structure/styles and added sticky, wheel, boundary and compact-TOC assertions. | Require settled real-wheel geometry at source offsets and test both sides of the source breakpoint. | `e6a5828`, `dabaa37` |
| HNT-017 | The Publisher navigation case expanded a label that was not a deterministic first-item target after content changes. | Selected the actual stable row and normalized the fixture after restoration. | Gate selectors must be unique, field-name based or baseline-derived; never depend on incidental text/index ordering. | `781d4c9` |
| HNT-018 | The visual lock lacked an immutable, complete authority corpus and could validate the implementation against partial or self-derived expectations. | Added source templates, DOM captures and desktop/mobile viewport/full screenshots for all families with SHA-256 manifesting. | Authority must be separate, complete, hashed, no-extra-file, non-symlinked and verified before browser assertions run. | `dabaa37`, `369482e` |
| HNT-019 | In Cloud rich-text mode, a representation-specific branch removed a wrapper and changed the editorial body hierarchy even though local fallback looked correct. | Moved the structural wrapper outside string/object/fallback branches. | Production-data-shape tests must assert identical required wrappers for rich-text object, string, absent and fallback values. | `4b175f5` |
| HNT-020 | Removing only `TINA_TOKEN` from the Astro phase was insufficient: public-prefixed aliases leaked into the second generated admin bundle and final archive. | Removed every environment key containing both `TINA` and `TOKEN` from the second Tina generation and Astro phases; rescanned `dist`, decompressed archive and live admin JS. | Strip all token aliases at every generation/compile stage and fail on any protected value in source output, `dist`, archive members or live assets. | `dff4174`, `945ca94` |
| HNT-021 | Intermediate build, upload, marker and HTTP successes were repeatedly capable of looking like completion. | Reclassified them as checkpoints and continued through live, admin, rollback, parity and cleanup proof. | `NO-PREMATURE-COMPLETION`; completion output is impossible until the final ordered gate is complete. | Launch record; `ce4a025` |
| HNT-022 | Implementation started without one immutable named authority, allowing inherited or destination-derived design choices. | Named, captured and hashed the supplied Herald source set. | `AUTHORITY-FIRST`; missing or contradictory authority is `BLOCKED`, never approximated. | `dabaa37`, `ce4a025` |
| HNT-023 | The early visual validator was too generic and had not proved that it could reject the defects it claimed to detect. | Added per-family controlled mutations and checked intended failure messages. | `GATE-SELF-TEST`; every positive invariant requires an independently failing negative. | `e6a5828`, `dabaa37`, `ce4a025` |
| HNT-024 | Local fixture shapes passed while destination Cloud rich text and optional data changed wrappers or visibility. | Exercised production-shaped object/string/absent/fallback records and fixed invariant wrapper placement. | `PRODUCTION-DATA-SHAPE` and `CLOUD-SOURCE-PRECEDENCE`. | `4b175f5`, `ce4a025` |
| HNT-025 | Inherited Tina endpoints/tokens could override the destination environment and build or render the wrong project. | Started clean child environments, loaded the approved site env explicitly and made destination identity win. | `DESTINATION-ENV-ONLY`; fail before launch on missing/mismatched client, branch or origin. | Launch record; `ce4a025` |
| HNT-026 | A process surviving a rebuild could serve stale code, while shutdown connection noise looked like a product failure. | Proved listener PID/cwd/fingerprint, closed browser work, stopped only the owned process and ran a live probe. | `FRESH-PROCESS-AND-SHUTDOWN`. | Launch record; `ce4a025` |
| HNT-027 | Concurrent Chromium suites caused contention and ambiguous evidence. | Serialized positive, negative and authenticated suites and retained each exit/result before the next. | `SERIAL-BROWSER-GATES` plus a browser-gate lock. | `ce4a025` |
| HNT-028 | Disk, `/tmp`, shared memory, RAM and stale browser pressure could make browser/build failures misleading. | Added resource measurements, minimum floors and bounded cleanup before heavy gates. | `RESOURCE-PREFLIGHT`; infrastructure exhaustion cannot be interpreted as design evidence. | `ce4a025` |
| HNT-029 | Non-interactive execution did not always inherit the expected Node/package-manager path. | Used explicit verified binaries and recorded versions before builds. | `DETERMINISTIC-TOOLCHAIN`; `command not found` blocks all build claims. | Launch record; `ce4a025` |
| HNT-030 | A local commit existed before remote push authorization and branch parity were proven. | Verified remote/fetch/push auth separately and checked local tip against `origin/main`. | `AUTHENTICATED-GIT-PREFLIGHT`; a local SHA is never remote evidence. | Launch record; `ce4a025` |
| HNT-031 | Publisher save/restore commits advanced the branch after a release had already been built, making the deployed SHA stale. | Fetched the restoration tip, inspected equality, rebuilt and redeployed that exact final commit; post-cutover admin proof became read-only. | `PUBLISHER-BEFORE-FINAL-SHA`; prohibit an infinite mutation/redeploy loop. | Launch record; `ce4a025` |
| HNT-032 | Protected inputs already supplied in project-specific storage were at risk of being searched broadly or requested again. | Used the approved project secret map and handled only variable names/paths in evidence. | `PROJECT-SECRET-MAP`; never print values or substitute credentials. | Launch record; `ce4a025` |
| HNT-033 | cPanel host normalization could append `:2083` to an already normalized endpoint. | Parsed protocol/port once and validated the final URL. | `CPANEL-ENDPOINT-NORMALIZATION` with duplicate-port negative coverage. | Launch record; `ce4a025` |
| HNT-034 | cPanel API application data arrived in both array and object-keyed shapes, breaking naive iteration and encouraging guessed roots. | Normalized response types and selected the exact domain application path. | `CPANEL-RESPONSE-NORMALIZATION`; never infer app/document roots from folder names. | Launch record; `ce4a025` |
| HNT-035 | A Cloudflare-facing IP was initially unsuitable as proof of the actual hosting origin/vhost. | Obtained hosting inventory and tested apex and `www` independently with TLS SNI. | `TRUE-ORIGIN-PROOF`; CDN response and private release marker are complementary evidence. | Launch record; `ce4a025` |
| HNT-036 | An island probe returned 404 because the harness used the wrong request shape, not because the island route was broken. | Reissued the correct same-origin `POST` with `application/x-tina-preview+json` and verified non-empty HTML wrapper/form data. | `AUTHENTICATED-ISLAND-POST` and `MINIMAL-RETRY-DIAGNOSTICS`. | Launch #23 messages 238332–238360; `ce4a025` |
| HNT-037 | Adding a release query to the initial admin URL changed the observed hash route and caused a false authentication failure. | Authenticated at canonical `/admin/`, captured the popup, returned to the original context and waited for a real field. | `CANONICAL-ADMIN-LOGIN`; cache bust only after authentication. | Launch #23 message 238370; `ce4a025` |
| HNT-038 | A new release reused a `node_modules` symlink owned by an older release, so aggressive cleanup could break production. | Verified and recorded the dependency edge and retained the owning release. | `SELF-CONTAINED-RUNTIME`; prefer release-owned production dependencies or protect verified shared owners. | Launch record; `ce4a025` |
| HNT-039 | Uploaded archives, extraction paths, deploy locks/logs, stale links, diagnostics and one-shot cron jobs could remain after success. | Removed owned temporary artifacts and reran health checks. | `RETENTION-CLEANUP`; final state is one active plus one approved rollback/runtime dependency and zero owned jobs. | Launch record; `ce4a025` |
| HNT-040 | Truncated terminal output and copied snippets obscured exit codes and could not support reliable acceptance. | Switched gates to parsed machine-readable JSON with preserved exits and sanitized evidence. | `STRUCTURED-EVIDENCE`; unparsed/truncated display is never acceptance proof. | `ce4a025` |
| HNT-041 | Publisher transaction evidence was not durably recording original/restored hashes, public marker visibility and unrelated drift. | Defined and retained a sanitized transaction artifact immediately after each run. | `EVIDENCE-ARTIFACT`; missing evidence makes the gate incomplete. | `ce4a025` |
| HNT-042 | Checks were run out of order, so later mutation, rebuild, deployment or cleanup could invalidate earlier proof. | Established one mandatory authority-to-post-cleanup sequence. | `CHECKPOINT-NOT-COMPLETION`; dependencies cannot be skipped or reordered. | `ce4a025` |
| HNT-043 | Malformed methods, URLs, auth flows and API assumptions risked triggering unnecessary product changes. | Classified and corrected the harness before touching assertions or application code. | `MINIMAL-RETRY-DIAGNOSTICS`; never weaken product gates to satisfy a broken probe. | Launch record; `ce4a025` |
| HNT-044 | “Close enough” visual work preserved broad style but changed exact DOM, fonts, spacing, imagery and breakpoints. | Restored literal source templates and assets. | `LITERAL-VISUAL-NON-APPROXIMATION`; only approved Tina values may differ. | `ca65df7`, `dabaa37`, `aae7aca` |
| HNT-045 | Matching SHA, release marker and HTTP 200 created false confidence while design defects remained. | Separated identity/availability proof from DOM, style, geometry, screenshot and interaction proof. | `SHA-HTTP-NOT-VISUAL-PROOF`. | `dabaa37`, `aae7aca` |
| HNT-046 | Destination Cloud data selected a different body/hierarchy path than local data. | Declared field-by-field source precedence and fixed Cloud-mode hierarchy. | `CLOUD-SOURCE-PRECEDENCE`; run the lock against destination Cloud records. | `4b175f5`, `aae7aca` |
| HNT-047 | Programmatic smooth scrolling measured the rail while it was still moving and could falsely “prove” sticky behavior. | Replaced it with settled real-wheel measurements across multiple steps and boundary behavior. | `REAL-WHEEL-STICKY-PROOF`. | `dabaa37`, `aae7aca` |
| HNT-048 | Desktop sticky-rail fixes could silently break the compact in-article TOC, or vice versa. | Locked wide rail and compact TOC as separate responsive contracts. | `RESPONSIVE-RAIL-TOC-CONTRACT`; test both sides of the source breakpoint. | `dabaa37`, `aae7aca` |
| HNT-049 | Testing only highlighted screenshots omitted home sections, archives, sitemap, 404, CTA and shared chrome. | Built a full family route/component/fixture matrix. | `COMPLETE-TEMPLATE-FAMILY-MATRIX`; every family gets desktop/mobile positive and negative proof. | `dabaa37`, `aae7aca` |
| HNT-050 | An authority manifest could contain duplicate/non-normalized paths, omit extra files or pass through symlinks/escapes. | Added uniqueness, normalization, lexical plus realpath containment, symlink rejection, full-tree enumeration and hash verification. | `FIXTURE-INTEGRITY-FIRST`; fixture failure occurs before any browser opens. | `369482e`, `ad6c7fa`, `c324082` |
| HNT-051 | Scanning only source or `dist` missed credentials inside generated admin assets and compressed release members. | Scanned final `dist`, decompressed archive members and live admin JS, reporting names only. | `DUAL-ARTIFACT-SECRET-SCAN`. | `dff4174`, `945ca94`, `aae7aca` |
| HNT-052 | Upload/extraction and short-SHA naming did not prove that local, remote, archive, physical release and active pointer were identical. | Packaged from `git archive <full HEAD>`, embedded/reopened `RELEASE_COMMIT` and compared every pointer. | `EXACT-SHA-PACKAGE-POINTER-PARITY`. | Launch record; `aae7aca` |
| HNT-053 | Cleanup could remove a runtime dependency or leave production unhealthy after earlier acceptance passed. | Reran route/assets, pointer, rollback/runtime, admin and read-only lock checks after cleanup. | `FINAL-POST-CLEANUP-ACCEPTANCE`; only the post-cleanup state may be reported final. | Launch record; `aae7aca` |
| HNT-054 | Policy text and marker checks could claim the demo lock existed even when no real browser validator, negative suite or authority was runnable. | Added executable preflight, exact command wiring, authority verification and controlled-negative preflight. | `EXECUTABLE-LOCK-READINESS`; missing machinery is machine-readable `BLOCKED`, and policy-only commands are rejected. | `531166f`, `d85443b`, `cbae5a4`, `17ebc1d`, `ef86629` |

The ledger is append-only for discovered migration failures. A row may be superseded only by a stricter row that names the superseded ID; silent deletion, collapsing several incidents into an unnamed generality, or retaining prevention without the problem and solution is forbidden.

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
