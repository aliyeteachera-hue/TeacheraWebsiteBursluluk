# P0-10 Observability + SLO Alarms (Go-Live)

Bu doküman, P0-10 DoD için tek akışta dashboard + alarm + collector + audit adımlarını verir.

## Kapsam
- API latency: `p95`, `p99`
- API error rate
- Queue depth / lag
- Worker fail rate
- DB / Redis health
- SMS / WhatsApp success rate

## 1) Env
Aşağıdaki env'ler production için set olmalı:
- `AWS_REGION` (ör. `eu-north-1`)
- `CRON_SECRET`
- `OBSERVABILITY_CLOUDWATCH_NAMESPACE` (öneri: `Teachera/ExamPlatform`)
- `OBSERVABILITY_DASHBOARD_NAME` (öneri: `teachera-p0-10-observability`)
- `OBSERVABILITY_ALARM_PREFIX` (öneri: `teachera-p0-10`)
- `OBSERVABILITY_ALARM_SNS_TOPIC_ARN` (opsiyonel ama önerilir)
- `WWW_BASE_URL`, `EXAM_API_BASE_URL`, `PANEL_API_BASE_URL`, `OPS_API_BASE_URL`

## 2) Collector endpoint
- Endpoint: `GET /api/ops/observability/collect`
- Auth: `Authorization: Bearer <CRON_SECRET>`
- Vercel cron: `*/5 * * * *`

Collector CloudWatch custom metric namespace'ine metrik yazar:
- `ApiLatencyP95Ms` (Dimension: `Endpoint`)
- `ApiLatencyP99Ms` (Dimension: `Endpoint`)
- `ApiErrorRatePct` (Dimension: `Endpoint`)
- `QueueDepth`
- `QueueLagSeconds`
- `WorkerFailRatePct15m`
- `DbHealth`
- `RedisHealth`
- `NotificationSuccessRatePct60m` (Dimension: `Channel=SMS|WHATSAPP`)

## 3) Dashboard + Alarm provision
```bash
npm run p0:observability:provision
```

Bu komut CloudWatch dashboard'ı ve alarm setini upsert eder.

## 4) Konsolide audit
```bash
npm run p0:observability:audit -- --http --aws
```

Beklenen:
- `overall_ready_for_p0_10 = true`
- `totals.fail = 0`

## 5) Time-saving combined run
```bash
npm run p0:quick
npm run p0:observability:provision
npm run p0:observability:audit -- --http --aws
```

## Önerilen eşik değerleri
- `OBS_SLO_P95_MS=1200`
- `OBS_SLO_P99_MS=2500`
- `OBS_SLO_ERROR_RATE_PCT=2`
- `OBS_SLO_QUEUE_DEPTH=200`
- `OBS_SLO_QUEUE_LAG_SECONDS=300`
- `OBS_SLO_WORKER_FAIL_RATE_PCT=5`
- `OBS_SLO_SMS_SUCCESS_RATE_PCT=85`
- `OBS_SLO_WA_SUCCESS_RATE_PCT=80`
