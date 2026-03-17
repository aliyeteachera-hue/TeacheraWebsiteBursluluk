# Panel Step-18 RBAC Policy Smoke

- Timestamp: 2026-03-17T07:29:27.647Z
- overall_ready_for_step_18: **true**
- pass: 21, fail: 0, warn: 0, skip: 0

## Checks

| id | status | detail |
| --- | --- | --- |
| rbac_dashboard_read | PASS | RBAC marker found. |
| rbac_candidates_read | PASS | RBAC marker found. |
| rbac_candidates_export_read | PASS | RBAC marker found. |
| rbac_notifications_read | PASS | RBAC marker found. |
| rbac_dlq_read | PASS | RBAC marker found. |
| rbac_unviewed_read | PASS | RBAC marker found. |
| rbac_audit_read | PASS | RBAC marker found. |
| rbac_audit_export_read | PASS | RBAC marker found. |
| rbac_candidates_actions_write | PASS | RBAC marker found. |
| rbac_notifications_actions_write | PASS | RBAC marker found. |
| rbac_dlq_actions_write | PASS | RBAC marker found. |
| rbac_unviewed_actions_write | PASS | RBAC marker found. |
| rbac_settings_write_super_admin | PASS | RBAC marker found. |
| unauth_GET_/api/panel/candidates | PASS | HTTP 401 |
| unauth_GET_/api/panel/notifications | PASS | HTTP 401 |
| unauth_GET_/api/panel/dlq | PASS | HTTP 401 |
| unauth_GET_/api/panel/unviewed-results | PASS | HTTP 401 |
| unauth_POST_/api/panel/candidates/actions | PASS | HTTP 401 |
| unauth_POST_/api/panel/notifications/actions | PASS | HTTP 401 |
| unauth_POST_/api/panel/dlq/actions | PASS | HTTP 401 |
| unauth_POST_/api/panel/unviewed-results/actions | PASS | HTTP 401 |

