# GTM Import Steps (Teachera)

Import dosyalari:

- Standart: `guidelines/gtm-teachera-ga4-container.json`
- Merge-safe (onerilen): `guidelines/gtm-teachera-ga4-container-merge-safe.json`

## Import oncesi

1. GTM'de import edilecek hedef container'i ac.
2. Import sirasinda `Merge` + `Rename conflicting` sec.
3. Import sonrasi su degiskeni guncelle:
- Standart dosya kullandiysan: `c - GA4 Measurement ID`
- Merge-safe dosya kullandiysan: `c - Teachera SEO GA4 Measurement ID`
- Deger: kendi GA4 olcum ID'niz (ornek: `G-ABCD1234EF`)

## Import sonrasi kontrol listesi

1. GA4 config tag'i `All Pages` trigger ile calisiyor mu?
: Standart: `Teachera / GA4 Configuration`
: Merge-safe: `Teachera SEO / GA4 Configuration`
2. `Custom Event` trigger'lari olustu mu? (ornek: `seo_landing_view`)
3. Preview modunda su eventler dataLayer'a dusuyor mu?
- `seo_landing_view`
- `seo_landing_cta_click`
- `cta_click`
- `engaged_30s`
- `scroll_depth_50`
- `lead_form_submit_success`
4. GA4 Admin > Conversions:
- `lead_form_submit_success`
- `whatsapp_click`
- `phone_click`
- `placement_exam_complete` (opsiyonel)

## Not

Bu template'ler, projedeki mevcut event sozlesmesine gore hazirlandi:

- `src/app/lib/analytics.ts`
- `guidelines/ga4-gtm-event-map.md`
