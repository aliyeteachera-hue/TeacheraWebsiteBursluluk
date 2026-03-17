# Frontend UAT + Bugfix Freeze + Release Candidate Report

- Timestamp: 2026-03-15T14:51:36.734Z
- overall_ready_for_release_candidate: **true**
- pass: 20, fail: 0, warn: 1, skip: 2

## Checks

| id | status | detail |
| --- | --- | --- |
| route_/bursluluk-2026 | PASS | HTTP 200 |
| route_/bursluluk/giris | PASS | HTTP 200 |
| route_/bursluluk/onay | PASS | HTTP 200 |
| route_/bursluluk/bekleme | PASS | HTTP 200 |
| route_/bursluluk/sinav | PASS | HTTP 200 |
| route_/bursluluk/sınav | PASS | HTTP 200 |
| route_/bursluluk/sonuc | PASS | HTTP 200 |
| route_/bursluluk/sonuç | PASS | HTTP 200 |
| route_/panel/login | PASS | HTTP 200 |
| route_/panel/dashboard | PASS | HTTP 200 |
| contract_schools_search | PASS | HTTP 200, items=1 |
| contract_candidate_login_missing_fields | PASS | HTTP 400 |
| contract_session_status_missing_attempt | PASS | HTTP 400 |
| e2e_start_session | PASS | HTTP 200 |
| e2e_candidate_login | PASS | HTTP 200 |
| e2e_session_status | PASS | HTTP 200 |
| e2e_answer_autosave | PASS | HTTP 200 |
| e2e_submit_exam | PASS | HTTP 200 |
| e2e_result_view | PASS | HTTP 200 |
| panel_unauth_me | PASS | HTTP 401 |
| panel_login | WARN | Skipped full panel auth smoke (set PANEL_EMAIL/PANEL_PASSWORD/PANEL_MFA_CODE). |
| panel_auth_me | SKIP | Skipped full panel auth smoke (missing env). |
| panel_dashboard | SKIP | Skipped full panel auth smoke (missing env). |

## Candidate

- release_candidate_id: `rc-frontend-uat-20260315145136`
- freeze_window_started_at: 2026-03-15T14:51:36.735Z
- notes: No blocking frontend/API contract regressions detected in this run.

