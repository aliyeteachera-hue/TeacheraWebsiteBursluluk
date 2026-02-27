---
name: web-font-performance
description: Optimize website font loading for faster render performance by auditing real usage, keeping only required families/weights, syncing local font files, and updating @font-face/preload strategy. Use when a task involves web font bloat, slow first paint, removing unused fonts, converting/serving fonts for production, or maintaining a repeatable font optimization workflow.
---

# Web Font Performance

Follow this workflow to keep font loading fast and predictable.

## 1. Audit Real Usage

Run the audit script from project root:

```bash
python3 skills/web-font-performance/scripts/audit_fonts.py
```

Use `--strict` in CI/local checks to fail on unknown family, missing file, or extra file:

```bash
python3 skills/web-font-performance/scripts/audit_fonts.py --strict
```

## 2. Sync Only Required Fonts

Copy and convert required source fonts into `public/fonts` (`woff2` by default):

```bash
python3 skills/web-font-performance/scripts/sync_fonts.py --source-dir ~/Downloads --dest-dir public/fonts --pythonpath ./.fonttools --remove-extra
```

Generate optional `.woff` fallbacks when needed:

```bash
python3 skills/web-font-performance/scripts/sync_fonts.py --source-dir ~/Downloads --dest-dir public/fonts --pythonpath ./.fonttools --include-woff --remove-extra
```

Edit `REQUIRED_FONTS` in `scripts/sync_fonts.py` when the design system changes.

## 3. Serve Fonts Locally

Define `@font-face` in `src/styles/fonts.css` and keep these defaults:

- Set `font-display: swap`.
- Keep family names exactly aligned with class names used in source.
- Point `src` URLs to `/fonts/...` in `public/fonts`.

## 4. Preload Only Critical Faces

Add 1-2 critical fonts in `index.html` using `rel="preload"`.

Use preload only for above-the-fold text styles; avoid preloading decorative fonts unless necessary.

## 5. Convert to Faster Formats When Tooling Exists

Prefer `woff2` with `woff` fallback for production.

If `fontTools` is unavailable, install it into a local folder and pass that folder via `--pythonpath`, or run `--fallback-otf` as temporary fallback.

## 6. Validate

Run:

```bash
pnpm build
python3 skills/web-font-performance/scripts/audit_fonts.py --strict
```

Confirm there are no missing font files and no unexpected extras.

## References

- See `references/font-performance-checklist.md` for the compact checklist and Teachera family mapping.
