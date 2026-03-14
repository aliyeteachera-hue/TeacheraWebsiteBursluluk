# Canonical Architecture v1
Date: March 13, 2026
Status: Draft for Approval

## 1. Purpose and Scope
This document is the single canonical technical baseline for the Teachera Online Bursluluk / Seviye Tespit system targeting 10,000-15,000 candidates.

It consolidates and resolves differences across:
- TeacheraSayfasıSeviyeTespitHostingTeknikAnalizi.docx
- bursluluk-sınavı-teknik-mimari_03-03-2026.docx
- SeviyeTespitBackend 2026-03-06 at 07.55.43.jpeg
- SeviyeTespitBackend-AWS-servisleriyle 2026-03-06 at 07.59.20.jpeg

## 2. Canonical v1 Decisions (Approved Baseline)

### 2.1 Domain and Runtime Boundaries
- Public web and candidate frontend: `https://teachera.com.tr`
- Candidate/exam APIs: `https://exam-api.teachera.com.tr`
- Panel APIs: `https://panel-api.teachera.com.tr`
- Operations APIs (health/observability/ops): `https://ops-api.teachera.com.tr`
- Panel UI canonical route: `https://teachera.com.tr/panel/*`
- Optional host alias allowed: `panel.teachera.com.tr` (must resolve to same panel UI behavior).

### 2.2 Mandatory Frontend Flows
Candidate flow routes must exist and be operational:
- `/bursluluk-2026`
- `/bursluluk/onay`
- `/bursluluk/giris`
- `/bursluluk/bekleme`
- `/bursluluk/sinav` and `/bursluluk/sınav`
- `/bursluluk/sonuc` and `/bursluluk/sonuç`

Panel flow routes must exist and be operational:
- `/panel/login`
- `/panel/dashboard`
- `/panel/candidates`
- `/panel/notifications`
- `/panel/dlq`
- `/panel/settings`
- `/panel/password-reset`

### 2.3 Canonical Service Modules
Mandatory backend module boundaries:
- Application Service
- Identity/Auth Service
- Exam Service / Exam Engine
- Result Service
- Notification Service
- Admin Service
- Scheduler Service
- Reporting & Analytics Service

### 2.4 Data and State Architecture
Mandatory data platform:
- PostgreSQL (production: HA, backup, PITR)
- Redis (session, rate-limit, counters/timers, short-lived state)
- Queue runtime (canonical v1): PostgreSQL `notification_jobs` + `dlq_jobs`
- SQS (optional in v1): infra/ops integration layer, not runtime dequeue source-of-truth
- Object Storage + CDN for media/static distribution

Core tables required in canonical schema:
- `campaigns`, `schools`, `applications`, `candidates`, `guardians`, `credentials`,
- `exam_attempts`, `exam_answers`, `results`,
- `notification_jobs`, `notification_events`, `activity_events`,
- `admin_users`, `roles`

### 2.5 Notification Pipeline (Queue-First)
Canonical sequence:
1. API writes job to `notification_jobs`.
2. Worker consumes queued jobs directly from DB (`FOR UPDATE SKIP LOCKED` lease pattern).
3. Provider send request.
4. Callback/webhook processed and verified.
5. `notification_events` and job status updated.
6. Retry policy: `1m -> 5m -> 15m -> 60m -> 6h`.
7. Max retry exhausted -> DLQ + panel manual action required.
8. If SQS exists in environment, it is treated as infra-level signal/observability channel, not dequeue authority.

### 2.6 Security and Compliance Baseline
Mandatory controls:
- Server-side exam logic (no answer key in frontend)
- Password hashing (`argon2` or `bcrypt`)
- First-password one-time/expiration flow
- MFA required for panel users
- RBAC role enforcement on server-side session/token claims
- Brute-force and rate-limit protection (auth/exam/results/forms)
- CAPTCHA server-side validation mandatory (fail-closed)
- PII encryption at rest (KMS-backed), role-scoped access
- Immutable/tamper-evident audit trail for critical admin actions
- KVKK consent versioning in backend records

### 2.7 Observability and Operational Readiness
Mandatory telemetry and alerts:
- API p95/p99 latency
- API error rate
- Queue depth/lag
- Worker failure rate
- DB and Redis health
- SMS/WA success rates
- Business funnel metrics (apply->login->start->complete->result-view)

Mandatory go-live operations package:
- Runbook
- War-room roles
- Escalation SLA
- Deploy freeze window
- Rollback plan
- Cutover checklist with approvals

## 3. Resolved Contradictions from Prior Analyses
1. Domain conflict resolved:
- Canonical v1 keeps UI on `teachera.com.tr` while enforcing API separation by subdomain.

2. Queue technology ambiguity resolved:
- Canonical v1 runtime queue = PostgreSQL (`notification_jobs` / `dlq_jobs`).
- AWS SQS remains optional infra integration in v1.
- RabbitMQ/Kafka remain future alternatives, not v1 default.

3. Generic vs AWS diagrams resolved:
- Generic blocks are functional requirements; AWS services are canonical v1 implementation.

4. Route naming mismatch resolved:
- Turkish and ASCII route aliases are both accepted for compatibility.

## 4. Decision Register (Owner + Deadline)
Status legend: `OPEN`, `IN_PROGRESS`, `APPROVED`

| ID | Decision to Finalize | Owner | Deadline | Status |
|---|---|---|---|---|
| D-01 | Final public panel host policy (`teachera.com.tr/panel/*` only vs dual-host with `panel.teachera.com.tr`) | Solution Architect | March 15, 2026 | OPEN |
| D-02 | `credentials` table migration and rollout plan (dual-write + backfill + cutover) | Backend Lead | March 17, 2026 | OPEN |
| D-03 | KVKK consent schema (`consent_version`, timestamp, legal text version) final contract | Legal/KVKK Owner + Backend Lead | March 18, 2026 | OPEN |
| D-04 | Candidate dedupe policy (phone vs national ID vs school+name fallback) | Product Owner + Data Lead | March 16, 2026 | OPEN |
| D-05 | Late-entry and reconnect/resume policy during exam | Product Owner + Exam Lead | March 16, 2026 | OPEN |
| D-06 | Result publishing strategy (single release window vs segmented release) | Product Owner + Operations Lead | March 17, 2026 | OPEN |
| D-07 | WhatsApp opt-in governance and template ownership | CRM/Comms Owner | March 18, 2026 | OPEN |
| D-08 | Anti-cheat scope for v1 (none/basic/advanced) | Product Owner + Security Lead | March 19, 2026 | OPEN |
| D-09 | SLO thresholds final numeric values and alarm paging targets | SRE/Ops Lead | March 17, 2026 | OPEN |
| D-10 | Load certification acceptance gate for 10k-15k (target profile and pass criteria) | QA Lead + SRE Lead | March 20, 2026 | OPEN |
| D-11 | Provider outage playbook ownership and escalation tree | Operations Lead | March 18, 2026 | OPEN |
| D-12 | Final go-live approval authority matrix (who can block/release) | Program Manager | March 21, 2026 | OPEN |

## 5. Immediate Implementation Priorities (Execution Order)
1. Close schema mismatch for `credentials`.
2. Lock decision D-01 (panel host policy) and update DNS/routing docs.
3. Freeze API contracts for candidate/panel/reporting endpoints.
4. Complete and sign D-03, D-04, D-05 policy items.
5. Re-run full evidence gate (P0-11 + P0-12 + topology/observability audits) before production cutover.

## 6. Acceptance Criteria for Canonical v1 Adoption
Canonical v1 is considered adopted when:
- All decisions D-01..D-12 are `APPROVED`.
- Route map and API map are consistent with this document.
- Production evidence artifacts are green and linked to the release.
- Stakeholders (Product, Backend, Ops, Security, QA) sign off on this document version.
