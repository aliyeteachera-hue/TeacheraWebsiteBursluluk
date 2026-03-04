# Google Analytics + Meta Live Setup (Teachera)

Bu rehber, kod tarafi hazirlandiktan sonra canli panel adimlarini tamamlamak icin kullanilir.

## Mevcut kimlikler

- GTM Container ID: `GTM-K9JW67GT`
- GA4 Measurement ID (onaylanan): `G-LZQ3PLT0ER`
- Google Ads Conversion ID: `AW-10934875583`

Meta Pixel ID hala eksikse, Events Manager'dan alinip GTM'e eklenmelidir.

## 1) Vercel environment degiskenleri

Proje > Settings > Environment Variables:

- `VITE_GTM_ID=GTM-K9JW67GT`
- (Opsiyonel referans) `VITE_GA4_MEASUREMENT_ID=G-LZQ3PLT0ER`
- (Opsiyonel referans) `VITE_GOOGLE_ADS_ID=AW-10934875583`
- (Meta baglaninca) `VITE_META_PIXEL_ID=<META_PIXEL_ID>`

Sonra production deploy alin.

## 2) GTM import + GA4 baglantisi

1. GTM'de ilgili container ac.
2. `guidelines/gtm-import-steps.md` dosyasindaki import adimlarini uygula.
3. Import sonrasi GA4 Measurement ID'yi `G-LZQ3PLT0ER` olarak guncelle.
4. Preview modunda asagidaki eventleri kontrol et:
   - `page_view`
   - `cta_click`
   - `lead_form_submit_success`
   - `whatsapp_click`
   - `phone_click`
   - `placement_exam_complete`

## 3) GA4 conversions

GA4 Admin > Conversions:

- `lead_form_submit_success` (primary)
- `whatsapp_click` (secondary)
- `phone_click` (secondary)
- `placement_exam_complete` (secondary, opsiyonel)

## 4) Meta Pixel baglantisi (GTM icinden)

1. Events Manager > Pixel ID kopyala.
2. GTM'de Meta Pixel base tag ekle (Community Template veya Custom HTML).
3. Event mapping:
   - `lead_form_submit_success` -> `Lead`
   - `whatsapp_click` -> `Contact`
   - `phone_click` -> `Contact`
   - `placement_exam_complete` -> `CompleteRegistration` (opsiyonel)
4. Meta Test Events ekraninda canli dogrula.

## 5) Consent enforcement

GTM tarafinda zorunlu:

- Analytics tag'leri: `analytics_storage = granted`
- Marketing tag'leri: `ad_storage`, `ad_user_data`, `ad_personalization = granted`

Uygulama tarafi consent update zaten `analytics.ts` icinden gonderilir.

## 6) Canli kontrol listesi

1. Siteye UTM ile giris yap: `?utm_source=test&utm_medium=cpc`.
2. GTM Preview'de event ve parametrelerin doldugunu kontrol et.
3. GA4 DebugView'de eventlerin geldigini kontrol et.
4. Meta Test Events'te Pixel eventlerini dogrula.
5. Tum kontroller dogruysa GTM Publish.
