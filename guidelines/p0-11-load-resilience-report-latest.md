# Teachera P0-11 Certified Load & Resilience Report

- Run ID: `2026-03-12T08-57-54-118Z`
- Generated At (UTC): `2026-03-12T08:58:53.687Z`
- Overall Ready: `true`
- Signed: `true`

## Burst Metrics

- Start success: **100%**
- Start p95: **1830 ms**
- Results success: **100%**
- Results p95: **1257 ms**

## Scenario Projection

- Effective RPS: **5.003**
- Window: **180 minutes**
- Projected max users in window: **54032**

## Resilience

- Outage errors captured: **12**
- Final pending after recovery (queued+retrying+dlq): **0**

## Checks

| Check | Status | Detail |
|---|---|---|
| burst_exam_start_success_rate | PASS | Start success 100% (target >= 95%). |
| burst_exam_start_p95_latency | PASS | Start p95 1830ms (target <= 2500ms). |
| burst_results_success_rate | PASS | Results success 100% (target >= 95%). |
| burst_results_p95_latency | PASS | Results p95 1257ms (target <= 2200ms). |
| provider_outage_simulation | PASS | Outage simulation captured failures (error-tagged=12, worker_failed_or_dlq=12). |
| dlq_replay_recovery | PASS | DLQ replay returned 3 requeued jobs (seeded immediate-DLQ: 3). |
| queue_backlog_recovery | PASS | Backlog residual 0/12 (0%) after recovery (target <= 5%). |
| scenario_10k_projection | PASS | Projected capacity 54032 users in 180m (target >= 10000). |
| scenario_15k_projection | PASS | Projected capacity 54032 users in 180m (target >= 15000). |
| signed_report | PASS | Signed report generated with HMAC-SHA256. |

