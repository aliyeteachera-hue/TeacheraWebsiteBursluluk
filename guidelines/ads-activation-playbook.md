# Ads Activation Playbook (Google + Meta + LinkedIn + TikTok)

Bu dokuman, `src/app/lib/analytics.ts` event sozlesmesi uzerinden reklam platformlarina aktivasyon stratejisini tanimlar.

## Hedef

- Ana hedef: `Nitelikli Lead`
- Dönüşüm modeli: `Aşamalı Funnel`
- 1P PII esleme: yok (anonim)

## Conversion mapping

Primary:

- `lead_form_submit_success`

Secondary:

- `whatsapp_click`
- `phone_click`
- `placement_exam_complete`

Intent:

- `level_assessment_open`
- `free_trial_open`
- `pricing_view`
- `contact_view`

Engagement:

- `engaged_30s`
- `scroll_depth_90`
- `cta_click`

## Audience kurallari

Lead-score tabanli segment:

- `hot`: `lead_score >= 60`
- `warm`: `lead_score >= 30 && < 60`
- `cold`: `lead_score < 30`

Platform kullanim:

- Google:
  - Search optimizasyonu: `lead_form_submit_success`
  - Remarketing seed: `warm`, `hot`, `placement_exam_complete`
- Meta:
  - TOF: `engaged_30s`, `scroll_depth_90`
  - MOF/BOF: `warm`, `hot`
  - Exclusion: son 30 gun `lead_form_submit_success`
- LinkedIn:
  - Test bütçesi ile `pricing_view`, `contact_view`, `level_assessment_open`
- TikTok:
  - TOF discovery: `engaged_30s`, `scroll_depth_90`
  - BOF: `warm`

Ortak exclusion:

- Son 30 gunde `lead_form_submit_success` olanlar tum kanallarda exclusion listesine alinmali.

## Consent zorunlulugu

- Analytics event forwarding: `analytics_storage = granted`
- Marketing tag forwarding: `ad_storage`, `ad_user_data`, `ad_personalization = granted`

## QA checklist

1. Consent kapaliyken analytics event fire olmamali.
2. UTM + gclid/fbclid/msclkid ile giriste attribution context event payload'larina eklenmeli.
3. `seo_landing_view -> cta_click -> intent -> lead` adimlari GA4 Explore funnel'da izlenmeli.
4. `lead_score` ve `lead_segment` event payload'larinda gorunmeli.
5. Her platformda test event goruntulenmeli ve audience listeleri 24-48 saatte dolmaya baslamali.
