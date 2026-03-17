# P0-12 Cutover + Hypercare + Rollback Drill Report

- Generated (UTC): `2026-03-17T11:06:15.401Z`
- Run ID: `2026-03-14T20-54-52-733Z`
- Overall Ready: `false`
- Hypercare Window (drill): **1440 minute(s)**

## Check Summary
- PASS: **11**
- FAIL: **2**
- WARN: **3**
- SKIP: **3**

## Checks
| Check | Status | Detail |
|---|---|---|
| cutover_package_audit_latest | PASS | Latest P0-12 package audit is ready. |
| cutover_www_route | PASS | HTTP 200 |
| cutover_exam_health | PASS | HTTP 200 |
| cutover_panel_me_unauth | PASS | HTTP 401 |
| cutover_ops_health | PASS | HTTP 200 |
| cutover_exam_start_flow | FAIL | start failed (HTTP 503). |
| cutover_exam_answer_flow | SKIP | Skipped because start flow failed. |
| cutover_exam_submit_flow | SKIP | Skipped because start flow failed. |
| cutover_exam_results_flow | SKIP | Skipped because start flow failed. |
| cutover_panel_login_dashboard | WARN | Panel login/dashboard smoke skipped (DATABASE_URL/POSTGRES_URL not set for temporary user creation). |
| cutover_worker_auth_guard | PASS | Worker rejects invalid secret (401). |
| cutover_worker_valid_secret | WARN | Skipped: worker secret missing (NOTIFICATION_WORKER_SECRET/CRON_SECRET). |
| cutover_webhook_signature_guard | PASS | Webhook rejects missing signature (401). |
| cutover_webhook_valid_signature | WARN | Skipped: webhook secret missing (NOTIFICATION_PROVIDER_WEBHOOK_SECRET). |
| hypercare_http_window | FAIL | Hypercare drill detected 7 critical HTTP incident(s). |
| hypercare_alarm_state | PASS | No critical alarms in ALARM state for prefix teachera-p0-10 (missing-data alarms: 38). |
| rollback_candidate_selection | PASS | Rollback candidates found for all services (dry-run only). |
| rollback_candidate_health | PASS | Rollback candidate health checks are acceptable (dry-run). |
| rollback_post_dry_run_stability | PASS | Primary domains remained stable after rollback dry-run simulation. |

