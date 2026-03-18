# Section 11 Policy Decisions v1

Status: APPROVED
Version: v1
Created_at_utc: 2026-03-18T00:00:00Z
Last_updated_utc: 2026-03-18T09:15:00Z
Effective_from_utc: 2026-03-18T09:15:00Z
Review_cycle: Monthly
Governance_mode: SINGLE_OWNER_SELF_ATTESTED

## Purpose
This document converts Section 11 open items into binding policy decisions with clear ownership, implementation mapping, and exception handling.

## Decision Lifecycle
- Status values: DRAFT_FOR_SIGNOFF | APPROVED | REJECTED | SUPERSEDED
- Change rule: In SINGLE_OWNER_SELF_ATTESTED mode, change is approved by Project Owner self-attestation + change-log entry. If ownership model changes to multi-role, re-approval is required.
- Exception rule: Temporary exceptions must include owner, end date, and audit record.

## Decision 01 - Multi-application dedupe rule
- Decision_id: S11-01
- Status: APPROVED
- Policy_statement: Candidate application dedupe is enforced by phone_e164 + campaign_code + normalized student_full_name. When duplicate is detected, system reuses existing candidate and creates an activity event.
- Business_owner: Product Owner
- Operational_owner: Admissions Ops Lead
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Backend Lead
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - API: /api/exam/session/start
  - DB: applications.dedupe_hash, candidates, activity_events
  - Panel: duplicate indicator on candidate row
  - Alerting: duplicate rate anomaly metric
- Exception_policy: Manual override only by SUPER_ADMIN; reason and ticket id mandatory.
- Notes: TBD

## Decision 02 - Forgot password and credential regeneration flow
- Decision_id: S11-02
- Status: APPROVED
- Policy_statement: Candidate credentials can be regenerated only through controlled flow with rate limit and audit logging. Previous credentials are revoked on regeneration.
- Business_owner: Product Owner
- Operational_owner: Support Lead
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Identity Service Owner
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - API: /api/exam/candidate/login, credential regeneration endpoint (if enabled)
  - DB: credentials, notification_jobs, notification_events, activity_events
  - Panel: manual credential resend action
  - Alerting: abnormal credential regeneration spikes
- Exception_policy: Emergency reset by OPERATIONS role with ticket reference.
- Notes: TBD

## Decision 03 - Late candidate exam entry policy
- Decision_id: S11-03
- Status: APPROVED
- Policy_statement: Late entry is allowed for a fixed grace window after exam_open_at. After grace window, new starts are blocked; existing active sessions may continue.
- Business_owner: Academic Director
- Operational_owner: Exam Ops Lead
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Exam Service Owner
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - API: /api/exam/session/start, /api/exam/session/status
  - Config: exam_open_at, late_entry_grace_minutes
  - Panel: exam gate controls and countdown
  - Alerting: late-entry denied count
- Exception_policy: Supervised manual unlock by SUPER_ADMIN with reason.
- Notes: TBD

## Decision 04 - Resume policy on connection loss
- Decision_id: S11-04
- Status: APPROVED
- Policy_statement: Candidate can resume same attempt using valid session token until attempt expires. Autosave is authoritative source for restoration.
- Business_owner: Product Owner
- Operational_owner: Exam Ops Lead
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Exam Service Owner
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - API: /api/exam/session/answer, /api/exam/session/status
  - DB: exam_attempts, exam_answers, exam_session_tokens
  - Frontend: autosave + unload fail-safe
  - Alerting: resume failure rate
- Exception_policy: No manual answer edits allowed; only technical session recovery.
- Notes: TBD

## Decision 05 - Result publish schedule policy
- Decision_id: S11-05
- Status: APPROVED
- Policy_statement: Results are published at configured schedule scope (global or campaign-segment). Before publish time, result endpoint returns pending state.
- Business_owner: Academic Director
- Operational_owner: Result Ops Lead
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Result Service Owner
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - API: /api/exam/results/:attemptId
  - DB: results.status, results.published_at
  - Panel: publish controls and status tracking
  - Alerting: publish delay and mismatch alerts
- Exception_policy: Emergency publish by SUPER_ADMIN with dual approval.
- Notes: TBD

## Decision 06 - WhatsApp opt-in and template ownership
- Decision_id: S11-06
- Status: APPROVED
- Policy_statement: WhatsApp sends are permitted only for users with recorded opt-in and approved template version. Template ownership and approval trail is mandatory.
- Business_owner: Marketing/Comms Lead
- Operational_owner: Messaging Ops Lead
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Notification Service Owner
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - API: /api/ops/unviewed-results/auto-whatsapp, provider webhook
  - DB: notification_jobs, notification_events, consent_records
  - Panel: unviewed-results actions and WA status columns
  - Alerting: WA fail/read ratios
- Exception_policy: No opt-in bypass permitted.
- Notes: TBD

## Decision 07 - Anti-cheat level policy
- Decision_id: S11-07
- Status: APPROVED
- Policy_statement: Baseline anti-cheat includes session integrity, rate-limit, tokenized attempts, and behavior telemetry. Additional proctoring controls require explicit legal and product approval.
- Business_owner: Academic Director
- Operational_owner: Exam Integrity Lead
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Exam Service Owner
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - API: session start/login/answer/submit guards
  - DB: activity_events, exam_attempts metadata
  - Panel: anomaly views and audit logs
  - Alerting: suspicious behavior indicators
- Exception_policy: No camera/audio capture without signed legal approval.
- Notes: TBD

## Decision 08 - Result objection process
- Decision_id: S11-08
- Status: APPROVED
- Policy_statement: Result objection requests are accepted within defined SLA window and tracked with immutable audit trail. Any score change requires dual approval.
- Business_owner: Academic Director
- Operational_owner: Support Lead
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Result Service Owner
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - API: objection intake endpoint (if enabled)
  - DB: activity_events/audit_log_entries + objection table (if enabled)
  - Panel: objection queue and status transitions
  - Alerting: objection backlog breach
- Exception_policy: No silent score updates; every change must be audited.
- Notes: TBD

## Decision 09 - KVKK retention and anonymization periods
- Decision_id: S11-09
- Status: APPROVED
- Policy_statement: PII retention periods are fixed by legal basis; expired records are anonymized or deleted via scheduled job with audit proof.
- Business_owner: Legal/KVKK Officer
- Operational_owner: Data Protection Officer
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Data Platform Owner
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - DB: pii fields, consent_records, audit_log_entries
  - Jobs: retention/anonymization scheduler
  - Panel: compliance reporting view
  - Alerting: retention job failures
- Exception_policy: Legal hold requires written case id and expiry.
- Notes: TBD

## Decision 10 - Operational escalation SLA
- Decision_id: S11-10
- Status: APPROVED
- Policy_statement: Incident escalation follows severity-based SLA with named owners, response deadlines, and communication channels.
- Business_owner: Operations Director
- Operational_owner: On-call Manager
- Legal_owner: Legal/KVKK Officer
- Engineering_owner: Platform Lead
- Effective_from_utc: 2026-03-18T09:15:00Z
- System_mapping:
  - Runbook: P0-12 go-live package
  - Monitoring: CloudWatch/SNS/SLO alarms
  - Panel: critical error code visibility
  - Reporting: incident timeline and postmortem archive
- Exception_policy: SLA override only by incident commander with postmortem note.
- Notes: TBD

## Required Approvals (Gate)
A decision can move to APPROVED when Project Owner signs in SINGLE_OWNER_SELF_ATTESTED mode.
- Project Owner: Aliye Teachera (`aliye@teachera.com.tr`)
- Delegation rule: If additional owners/maintainers are added, governance must switch to multi-role approval model.

## Signoff Link
- Signoff record file: guidelines/section-11-signoff-v1.json
