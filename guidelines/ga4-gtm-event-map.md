# GA4 + GTM Event Map

Bu dokuman, Teachera web sitesinde kullanilan event adlarini, parametre sozlesmesini ve Konya/Turkiye SEO funnel kurgusunu tanimlar.

## Data Layer sozlesmesi

Tum eventler `src/app/lib/analytics.ts` uzerinden `window.dataLayer` ve (varsa) `gtag` iletilir.

Ortak context alanlari:

- `page_path`
- `page_location`
- `page_title`
- `page_type` (`home`, `program`, `pricing`, `contact`, `placement_exam`, `seo_landing`, `speakup`, `other`)
- `language_interest`
- `program_interest`
- `geo_intent`
- `session_id`
- `visit_id`
- `event_id`
- `event_timestamp`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid`, `fbclid`, `msclkid`
- `first_touch_utm_*`, `first_touch_gclid`, `first_touch_fbclid`, `first_touch_msclkid`
- `last_touch_utm_*`, `last_touch_gclid`, `last_touch_fbclid`, `last_touch_msclkid`
- `first_touch_captured_at`
- `last_touch_captured_at`
- `funnel_name`, `funnel_landing_path`, `funnel_last_cta_id`, `funnel_last_destination`, `funnel_updated_at`
- `lead_score` (0-100)
- `lead_segment` (`cold`, `warm`, `hot`)

## Event map

| Event | Ne zaman tetiklenir | Onemli parametreler | GA4 conversion |
|---|---|---|---|
| `page_view` | Route degisiminde | ortak context | Hayir |
| `seo_landing_view` | `/konya-*` ve `/turkiye-online-dil-kursu` sayfa goruntulemesi | `funnel_name`, `landing_path`, `funnel_step=landing_view` | Hayir |
| `seo_landing_cta_click` | Konya/Turkiye landing hero veya rehber link tiklamasi | `cta_id`, `cta_destination`, `cta_position`, `funnel_step=cta_click` | Hayir |
| `cta_click` | Sayfadaki link/button tiklamalari | `cta_id`, `cta_text`, `cta_destination`, `cta_location`, `cta_tag`, `cta_type` | Hayir |
| `free_trial_open` | Ucretsiz deneme modal acilisi | `source` | Hayir |
| `level_assessment_open` | Seviye tespit modal acilisi | `source` | Hayir |
| `hero_language_cta_click` | Ana sayfa dil rozetlerinden programa gidis | `cta_label`, `cta_destination`, `cta_location` | Hayir |
| `scroll_depth_50` | Sayfada %50 scroll derinligine ulasilinca | `scroll_depth=50` | Hayir |
| `scroll_depth_90` | Sayfada %90 scroll derinligine ulasilinca | `scroll_depth=90` | Hayir |
| `engaged_30s` | Sayfada 30 saniye aktif kalininca | `engagement_seconds=30` | Hayir |
| `form_start` | Formdaki ilk alan odagi | `form_id`, `form_name`, `form_method`, `form_action` | Hayir |
| `form_step` | Formda yeni bir alan dolduruldugunda | `form_id`, `form_step_index`, `form_field` | Hayir |
| `form_abandon` | Form baslatilip terk edildiginde | `form_id`, `completed_steps`, `abandon_reason`, `elapsed_seconds` | Hayir |
| `whatsapp_click` | WhatsApp floating widget veya `wa.me` link tiklamasi | `source`, `href`, `phone_number`, `link_text` | Evet (onerilen) |
| `phone_click` | `tel:` link tiklamasi | `phone_number`, `link_text` | Evet (onerilen) |
| `mailto_click` | `mailto:` link tiklamasi | `email`, `link_text` | Opsiyonel |
| `pricing_view` | `/fiyatlar` route goruntulendiginde | `source` | Opsiyonel |
| `contact_view` | `/iletisim` route goruntulendiginde | `source` | Opsiyonel |
| `placement_exam_start` | Seviye tespit sinavi baslatildiginda | `exam_language`, `age_range`, `question_count`, `exam_bank` | Opsiyonel |
| `placement_exam_complete` | Sinav tamamlandiginda/sure doldugunda/terk edildiginde | `completion_status`, `score`, `percentage`, `answered_count`, `duration_seconds` | Evet (opsiyonel) |
| `lead_form_submit_attempt` | Form endpoint POST oncesi | `form_subject`, `field_count`, `endpoint_domain`, `delivery_method` | Hayir |
| `lead_form_submit_success` | Form endpoint POST basarili | `form_subject`, `field_count`, `delivery_method` | Evet (onerilen) |
| `lead_form_submit_failure` | Form endpoint POST hatasi | `form_subject`, `field_count`, `error_message` | Hayir |
| `cookie_consent_updated` | Cerez tercihleri kaydedildiginde | `action`, `analytics`, `marketing`, `personalization` | Hayir |

## Konya/Turkiye funnel

Funnel adi: `konya_turkiye_seo_funnel`

Adimlar:

1. `seo_landing_view`
2. `seo_landing_cta_click` veya `cta_click`
3. `free_trial_open` / `level_assessment_open` / `whatsapp_click` / `phone_click`
4. `lead_form_submit_success`

## Lead score segmentasyonu

Skorlama kurali:

- `lead_form_submit_success`: +40
- `whatsapp_click`: +25
- `phone_click`: +25
- `level_assessment_open`: +20
- `free_trial_open`: +15
- `pricing_view`: +10
- `seo_landing_cta_click`: +8
- `hero_language_cta_click`: +5

Segmentler:

- `hot`: >=60
- `warm`: 30-59
- `cold`: <30

## GTM kurulum notlari

1. GTM'de Data Layer Variable olustur:
- `dlv_cta_id`
- `dlv_cta_destination`
- `dlv_source`
- `dlv_form_subject`
- `dlv_funnel_name`
- `dlv_funnel_landing_path`
- `dlv_lead_score`
- `dlv_lead_segment`
- `dlv_page_type`
- `dlv_visit_id`
- `dlv_event_id`

2. Custom Event trigger olustur:
- Her event adi icin bir trigger (ornek: `seo_landing_view`, `lead_form_submit_success`)

3. GA4 Event tag olustur:
- Event name'i GTM custom event adi ile birebir gonder
- Parametreleri ilgili Data Layer Variable'lara map et

4. Consent enforcement:
- Marketing tag'leri icin GTM consent ayarlarinda `ad_storage`, `ad_user_data`, `ad_personalization` kosullari zorunlu olsun.
- Analytics tag'leri `analytics_storage` kosuluyla calissin.

5. GA4 Admin > Conversions:
- `lead_form_submit_success`
- `whatsapp_click`
- `phone_click`
- `placement_exam_complete` (istege bagli)

## Raporlama (onerilen)

- Explore Funnel:
1. `seo_landing_view`
2. `cta_click` veya `seo_landing_cta_click`
3. `level_assessment_open` / `free_trial_open`
4. `lead_form_submit_success`

- Kirma boyutlari:
- `funnel_landing_path`
- `utm_source`
- `utm_medium`
- `cta_id`
- `lead_segment`
- `page_type`
