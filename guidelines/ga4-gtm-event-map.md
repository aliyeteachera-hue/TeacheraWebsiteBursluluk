# GA4 + GTM Event Map

Bu dokuman, Teachera web sitesinde kullanilan event adlarini, parametre sozlesmesini ve Konya/Turkiye SEO funnel kurgusunu tanimlar.

## Data Layer sozlesmesi

Tum eventler `src/app/lib/analytics.ts` uzerinden `window.dataLayer` ve (varsa) `gtag` iletilir.

Ortak context alanlari:

- `page_path`
- `page_location`
- `page_title`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid`, `fbclid`, `msclkid`
- `funnel_name`, `funnel_landing_path`, `funnel_last_cta_id`, `funnel_last_destination`, `funnel_updated_at`

## Event map

| Event | Ne zaman tetiklenir | Onemli parametreler | GA4 conversion |
|---|---|---|---|
| `page_view` | Route degisiminde | ortak context | Hayir |
| `seo_landing_view` | `/konya-*` ve `/turkiye-online-dil-kursu` sayfa goruntulemesi | `funnel_name`, `landing_path`, `funnel_step=landing_view` | Hayir |
| `seo_landing_cta_click` | Konya/Turkiye landing hero veya rehber link tiklamasi | `cta_id`, `cta_destination`, `cta_position`, `funnel_step=cta_click` | Hayir |
| `free_trial_open` | Ucretsiz deneme modal acilisi | `source` | Hayir |
| `level_assessment_open` | Seviye tespit modal acilisi | `source` | Hayir |
| `whatsapp_click` | WhatsApp floating widget veya `wa.me` link tiklamasi | `source`, `href`, `phone_number`, `link_text` | Evet (onerilen) |
| `phone_click` | `tel:` link tiklamasi | `phone_number`, `link_text` | Evet (onerilen) |
| `mailto_click` | `mailto:` link tiklamasi | `email`, `link_text` | Opsiyonel |
| `lead_form_submit_attempt` | Form endpoint POST oncesi | `form_subject`, `field_count`, `endpoint_domain` | Hayir |
| `lead_form_submit_success` | Form endpoint POST basarili | `form_subject`, `field_count` | Evet (onerilen) |
| `lead_form_submit_failure` | Form endpoint POST hatasi | `form_subject`, `field_count`, `error_message` | Hayir |
| `cookie_consent_updated` | Cerez tercihleri kaydedildiginde | `action`, `analytics`, `marketing`, `personalization` | Hayir |

## Konya/Turkiye funnel

Funnel adi: `konya_turkiye_seo_funnel`

Adimlar:

1. `seo_landing_view`
2. `seo_landing_cta_click`
3. `free_trial_open` / `level_assessment_open` / `whatsapp_click` / `phone_click`
4. `lead_form_submit_success`

## GTM kurulum notlari

1. GTM'de Data Layer Variable olustur:
- `dlv_cta_id`
- `dlv_cta_destination`
- `dlv_source`
- `dlv_form_subject`
- `dlv_funnel_name`
- `dlv_funnel_landing_path`

2. Custom Event trigger olustur:
- Her event adi icin bir trigger (ornek: `seo_landing_view`, `lead_form_submit_success`)

3. GA4 Event tag olustur:
- Event name'i GTM custom event adi ile birebir gonder
- Parametreleri ilgili Data Layer Variable'lara map et

4. GA4 Admin > Conversions:
- `lead_form_submit_success`
- `whatsapp_click`
- `phone_click`

## Raporlama (onerilen)

- Explore Funnel:
1. `seo_landing_view`
2. `seo_landing_cta_click`
3. `lead_form_submit_success`

- Kirma boyutlari:
- `funnel_landing_path`
- `utm_source`
- `utm_medium`
- `cta_id`
