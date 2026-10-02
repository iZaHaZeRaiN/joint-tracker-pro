# Money / WordPress Release Preflight — Gate 1 benchmark checkpoint

Date: 2026-10-02

This file records disposable benchmark work on the temporary branch only. `main` is not part of this experiment.

## Completed GitHub Actions runs

- ShortPixel 6.4.3 — run 37045024429
- Debugger & Troubleshooter 1.3.0 — run 37045830201
- HivePress Authentication 1.1.5 fix — run 37046346145
- FluentAuth 2.1.2 → 3.0.0 blind v0.4 — run 37047461282
- FluentAuth precision replay v0.5 — run 37048524214

## What the comparison showed

### Official Plugin Check / WPCS

The official WordPress Plugin Check action and WPCS both executed successfully on real plugin artifacts. A red workflow does not necessarily mean infrastructure failure: Plugin Check returns non-zero when reportable errors are present.

Plugin Check output is broad and whole-plugin oriented. Across the tested cases it produced repository metadata, text-domain, database, filesystem, nonce, enqueue, naming and compatibility findings.

In the Debugger & Troubleshooter and HivePress runs, the visible Plugin Check output did not explicitly isolate the known authentication trust-boundary issue that motivated the release benchmark.

### FluentAuth blind stress test

v0.4 result:
- Concrete risk: HIGH
- Review priority: HIGH
- Review score: 425
- Changed files: 323
- Added PHP lines: 56,146

The blind test exposed obvious false positives:
- test fixture `eval()`
- unit-test `wp_set_current_user()`
- object method `PasskeyStore::rename()` mistaken for filesystem `rename()`
- normal WebAuthn `base64_decode()`

v0.5 precision changes:
- exclude tests / fixtures / build / dist / language noise from release risk
- ignore comment-only matches
- distinguish global PHP filesystem functions from object/static methods
- dynamic decode → review surface, not automatic HIGH
- unauthenticated AJAX additions → HIGH-priority review surface, not automatic vulnerability claim
- Plugin Check set to continue-on-error so comparison artifacts are still uploaded

v0.5 replay:
- Concrete risk: HIGH
- Review priority: HIGH
- Review score: 153
- Changed files: 246
- Added PHP lines: 32,529
- Only one concrete HIGH remained: `@unlink($path)` in `UploadsExecutionCheck.php`

Relevant review hotspots still surfaced:
- authentication / identity
- unauthenticated AJAX
- authorization / capabilities
- redirects
- database operations
- state mutations
- SocialAuthHandler

After freezing the blind result, repository history was inspected. The 3.0.0-era commit `f242f791...` (“Harden social login”) fixed email verification, OAuth audience/state validation, state replay, cookie attributes and redirect validation — the same kind of trust-boundary surface the release-diff product is intended to prioritize.

## Gate 1

Still OPEN.

Positive signal: release-delta prioritization can surface changed trust boundaries that are buried inside broad whole-plugin reports.

Negative signal: heuristics become noisy on large releases unless production scope and semantic context are enforced.

Next benchmark standard: 5–10 releases, measure top-N security-file coverage, Plugin Check/WPCS overlap, false positives, and whether the first 3–5 findings are actionable.
