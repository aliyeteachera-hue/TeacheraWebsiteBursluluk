# P0-5 Go-Live Evidence (2026-03-11)

## Scope
P0-5: Implement production worker scheduler + webhook reconciliation.

DoD:
1. Scheduled worker trigger is live
2. Provider webhook endpoint is live and signature-verified
3. Delivery/read callbacks update job state correctly

## Environment
- Production base URL: `https://teachera.com.tr`
- Validation date: `2026-03-11`
- Auth: `Authorization: Bearer <CRON_SECRET>` for worker endpoint
- Webhook signature: HMAC-SHA256 using provider webhook secret

## Evidence Summary

### 1) Scheduled worker trigger live
Command:
```bash
curl -i -sS "https://teachera.com.tr/api/notifications/worker?limit=3&reconcile_limit=3" \
  -H "Authorization: Bearer <CRON_SECRET>"
```
Observed response (summary):
```text
HTTP/2 200
{"ok":true,"requested_limit":3,...,"reconciliation":{"fetched":0,"applied":0,"pending":0,"dropped":0,"failed":0}}
```
Result: PASS

### 2) Webhook endpoint live + signature verification

#### 2.1 Invalid signature is rejected
Command:
```bash
curl -i -sS -X POST "https://teachera.com.tr/api/notifications/provider-webhook" \
  -H "content-type: application/json" \
  -H "x-provider-signature: sha256=deadbeef" \
  --data '{"event":"delivery"}'
```
Observed response (summary):
```text
HTTP/2 401
{"ok":false,"error":"invalid_webhook_signature","message":"Webhook signature verification failed."}
```
Result: PASS

#### 2.2 Valid signature is accepted
Command (conceptual):
```bash
BODY='{"event":"delivery","status":"delivered","job_id":"<nonexistent-job-id>"}'
SIG=$(printf "%s" "$BODY" | openssl dgst -sha256 -hmac "<WEBHOOK_SECRET>" -binary | xxd -p -c 256)
curl -i -sS -X POST "https://teachera.com.tr/api/notifications/provider-webhook" \
  -H "content-type: application/json" \
  -H "x-provider-signature: sha256=$SIG" \
  --data "$BODY"
```
Observed response (summary):
```text
HTTP/2 202
{"ok":true,"queued_for_reconciliation":true,"webhook_inbox_id":"198159af-da0c-4471-be57-8120aa6db595","status":"DELIVERED"}
```
Result: PASS

### 3) Delivery/Read callback updates job state correctly

#### 3.1 Create real notification job via exam start
Command (conceptual):
```bash
curl -i -sS -X POST "https://teachera.com.tr/api/exam/session/start" \
  -H "content-type: application/json" \
  --data '{...}'
```
Observed response (summary):
```text
HTTP/2 200
{"ok":true,"session":{"credentialsSmsStatus":"QUEUED","credentialsSmsJobId":"23ce95f9-8f1a-4602-a124-6aa3eb25bffc",...}}
```
Result: PASS

#### 3.2 Send signed DELIVERY callback for that job
Observed response (summary):
```text
HTTP/2 200
{"ok":true,"job_id":"23ce95f9-8f1a-4602-a124-6aa3eb25bffc","status":"DELIVERED","reconciled_from_inbox":false}
```
Result: PASS

#### 3.3 Send signed READ callback for that job
Observed response (summary):
```text
HTTP/2 200
{"ok":true,"job_id":"23ce95f9-8f1a-4602-a124-6aa3eb25bffc","status":"READ","reconciled_from_inbox":false}
```
Result: PASS

#### 3.4 Verify DB state
Observed DB row (summary):
```json
{
  "id": "23ce95f9-8f1a-4602-a124-6aa3eb25bffc",
  "status": "READ",
  "provider_message_id": "pmid-23ce95f9-8f1a-4602-a124-6aa3eb25bffc",
  "retry_count": 0,
  "next_retry_at": null,
  "last_error_code": null,
  "updated_at": "2026-03-11T01:16:43.131Z"
}
```
Result: PASS

### 4) Reconciliation loop is active
Worker run after unmatched callback:
```text
HTTP/2 200
{"ok":true,...,"reconciliation":{"fetched":1,"applied":0,"pending":1,"dropped":0,"failed":0}}
```
Inbox row summary for `198159af-da0c-4471-be57-8120aa6db595`:
```json
{
  "reconciliation_status": "PENDING",
  "reconcile_attempt_count": 4,
  "next_attempt_at": "2026-03-11T02:35:30.391Z",
  "last_error": "job_not_found"
}
```
Result: PASS

## Final Verdict
P0-5 is completed successfully in production as of 2026-03-11.

## Note
- `NOTIFICATION_PROVIDER_WEBHOOK_SIGNING_SECRET` can be set separately; current validation succeeded via fallback secret (`NOTIFICATION_PROVIDER_WEBHOOK_SECRET`).
