# P0-12 Cutover + Hypercare + Rollback Drill Report

- Generated (UTC): `2026-03-14T20:51:45.798Z`
- Run ID: `2026-03-14T20-49-16-702Z`
- Overall Ready: `true`
- Hypercare Window (drill): **2 minute(s)**

## Check Summary
- PASS: **19**
- FAIL: **0**
- WARN: **0**
- SKIP: **0**

## Checks
| Check | Status | Detail |
|---|---|---|
| cutover_package_audit_latest | PASS | Latest P0-12 package audit is ready. |
| cutover_www_route | PASS | HTTP 200 |
| cutover_exam_health | PASS | HTTP 200 |
| cutover_panel_me_unauth | PASS | HTTP 401 |
| cutover_ops_health | PASS | HTTP 200 |
| cutover_exam_start_flow | PASS | exam session start succeeded. |
| cutover_exam_answer_flow | PASS | answer accepted. |
| cutover_exam_submit_flow | PASS | submit accepted. |
| cutover_exam_results_flow | PASS | results fetched successfully. |
| cutover_panel_login_dashboard | PASS | Panel login -> auth/me -> dashboard -> logout flow succeeded. |
| cutover_worker_auth_guard | PASS | Worker rejects invalid secret (401). |
| cutover_worker_valid_secret | PASS | Worker accepts valid secret (200). |
| cutover_webhook_signature_guard | PASS | Webhook rejects missing signature (401). |
| cutover_webhook_valid_signature | PASS | Webhook accepted signed callback (202). |
| hypercare_http_window | PASS | Hypercare drill window clean (6 samples, 2m). |
| hypercare_alarm_state | PASS | No critical alarms in ALARM state for prefix teachera-p0-10 (missing-data alarms: 38). |
| rollback_candidate_selection | PASS | Rollback candidates found for all services (dry-run only). |
| rollback_candidate_health | PASS | Rollback candidate health checks are acceptable (dry-run). |
| rollback_post_dry_run_stability | PASS | Primary domains remained stable after rollback dry-run simulation. |

