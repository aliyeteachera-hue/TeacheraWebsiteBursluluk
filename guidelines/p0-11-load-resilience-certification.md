# P0-11 Certified Load & Resilience (10k–15k)

Bu kılavuz P0-11 DoD’yi tek akışta, zaman kazandıran şekilde kapatır:

- Burst test: `exam start` + `results`
- Provider outage simülasyonu
- Queue backlog recovery + DLQ replay
- Signed report üretimi

## 1) Zorunlu env

- `DATABASE_URL` veya `POSTGRES_URL`
- `NOTIFICATION_WORKER_SECRET` veya `CRON_SECRET`
- `EXAM_API_BASE_URL` (öneri: `https://exam-api.teachera.com.tr`)
- `P0_11_REPORT_SIGNING_KEY` (rapor imzası için)

## 2) Tek komutlu sertifikasyon (önerilen)

```bash
npm run p0:load-resilience:certify -- \
  --users 220 \
  --start_concurrency 44 \
  --answer_submit_concurrency 60 \
  --results_concurrency 80 \
  --outage_jobs 100 \
  --outage_dlq_seed 16 \
  --worker_batch 140 \
  --scenario_window_minutes 180 \
  --scenario_min_users 10000 \
  --scenario_max_users 15000
```

Not:
- Script güvenlik için varsayılan olarak yalnızca `P0_11_*` kampanya kodu ile çalışır.
- Ortak kampanya kullanmak istersen explicit olarak `--allow_shared_campaign true` ver.

Çıktı:

- JSON: `guidelines/p0-11-load-resilience-report-latest.json`
- Özet: `guidelines/p0-11-load-resilience-report-latest.md`

## 3) İmza doğrulama

```bash
npm run p0:load-resilience:verify-signature
```

Başarılı doğrulamada:

- `ok: true`
- `sha_ok: true`
- `signature_ok: true`

## 4) Hızlı karar kriteri

`overall_ready_for_p0_11: true` ise P0-11 kapanır.

Minimum beklenenler:

- `burst_exam_start_success_rate = PASS`
- `burst_results_success_rate = PASS`
- `provider_outage_simulation = PASS`
- `queue_backlog_recovery = PASS`
- `scenario_10k_projection = PASS`
- `scenario_15k_projection = PASS`
- `signed_report = PASS`

## 5) Notlar

- Outage/recovery testi dış provider’a bağlı değildir:
  - `fault://provider-outage/...` recipient’leri worker içinde kontrollü hata üretir.
  - `fault://provider-ok/...` recipient’leri worker içinde kontrollü başarı üretir.
- Worker çağrıları test kampanyası ile sınırlandırılır (`campaign_code` filter), canlı kuyruk etkisi minimize edilir.
