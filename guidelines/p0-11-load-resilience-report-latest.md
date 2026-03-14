# Teachera P0-11 Certified Load & Resilience Report

- Run ID: `2026-03-14T20-08-45-701Z`
- Generated At (UTC): `2026-03-14T20:10:12.959Z`
- Overall Ready: `true`
- Signed: `true`

## Burst Metrics

- Direct executed users: **200**
- Start concurrency: **20**
- Start success: **100%**
- Start p95: **1974 ms**
- Results success: **100%**
- Results p95: **1423 ms**

## Scenario Projection

- Effective RPS: **15.172**
- Window: **180 minutes**
- Projected max users in window: **163857**

## Resilience

- Outage errors captured: **40**
- Final pending after recovery (queued+retrying+dlq): **0**

## Checks

| Check | Status | Detail |
|---|---|---|
| burst_exam_start_success_rate | PASS | Start success 100% (target >= 95%). |
| burst_exam_start_p95_latency | PASS | Start p95 1974ms (target <= 2500ms). |
| burst_results_success_rate | PASS | Results success 100% (target >= 95%). |
| burst_results_p95_latency | PASS | Results p95 1423ms (target <= 2200ms). |
| provider_outage_simulation | PASS | Outage simulation captured failures (error-tagged=40, worker_failed_or_dlq=40). |
| dlq_replay_recovery | PASS | DLQ replay returned 10 requeued jobs (seeded immediate-DLQ: 10). |
| queue_backlog_recovery | PASS | Backlog residual 0/40 (0%) after recovery (target <= 5%). |
| direct_peak_evidence | PASS | Direct execution evidence met (200 users, start concurrency 20). |
| scenario_10k_projection | PASS | Projected capacity 163857 users in 180m (target >= 10000). |
| scenario_15k_projection | PASS | Projected capacity 163857 users in 180m (target >= 15000). |
| signed_report | PASS | Signed report generated with HMAC-SHA256. |

