# Font Performance Checklist

1. Keep only the families and weights used by active routes/components.
2. Host fonts locally in `public/fonts` to avoid third-party handshake latency.
3. Prefer `woff2` then `woff`; if conversion tools are unavailable, use `otf` as fallback.
4. Set `font-display: swap` on every `@font-face`.
5. Preload only above-the-fold critical faces (usually 1-2 files).
6. Remove extra files from `public/fonts` to reduce accidental downloads.
7. Re-run audit after UI updates.
8. Rebuild and verify no missing-family regressions.

## Recommended Family Mapping (Teachera)

- `Neutraface_2_Text:Book` -> `neutra2-text-book.woff2` (optional `neutra2-text-book.woff` fallback)
- `Neutraface_2_Text:BookItalic` -> `neutra2-text-book-italic.woff2` (optional `neutra2-text-book-italic.woff` fallback)
- `Neutraface_2_Text:Demi` -> `neutra2-text-demi.woff2` (optional `neutra2-text-demi.woff` fallback)
- `Neutraface_2_Text:Bold` -> `neutra2-text-bold.woff2` (optional `neutra2-text-bold.woff` fallback)
- `Luxury:Gold` -> `luxury-gold.woff2` (optional `luxury-gold.woff` fallback)
- `Retro_Signature` / `Retro_Signature:Regular` -> `retro-signature.woff2` (optional `retro-signature.woff` fallback)
- `Bobby_Jones_Soft` -> `bobby-jones-soft.woff2` (optional `bobby-jones-soft.woff` fallback)
