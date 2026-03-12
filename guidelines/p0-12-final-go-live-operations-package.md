# P0-12 Final Go-Live Operations Package (Teachera)

Bu doküman, canlıya geçiş için operasyonel kontrol paketidir.
Hedef: kesintisiz cutover, hızlı rollback, net sorumluluk ve SLA ile war-room yönetimi.

## 1) Runbook (Go-Live)
1. Deploy freeze başlat (feature freeze + only hotfix).
2. Prod env freeze snapshot al (`vercel env pull`, AWS resource IDs, alarm state).
3. Health gates kontrol et:
   - `https://exam-api.teachera.com.tr/api/health`
   - `https://panel-api.teachera.com.tr/api/panel/auth/me` (401/403 expected)
   - `https://ops-api.teachera.com.tr/api/health`
4. Worker + webhook live path doğrula:
   - worker trigger
   - provider callback signature doğrulaması
5. Smoke set çalıştır:
   - start -> answer -> submit -> results
   - queue fail/recovery
   - panel dashboard read
6. Alarm ack kanallarını doğrula (SNS/email).
7. Cutover onayı ve trafik geçişi.

## 2) War-Room Roles
- Incident Commander (IC): karar ve iletişim sorumlusu
- Ops Lead: infra, DB/Redis/SQS/CloudFront
- Backend Lead: API/worker/webhook
- Frontend Lead: form/exam/panel UI
- QA Lead: smoke/load check gatekeeper
- Comms Owner: stakeholder güncellemeleri

## 3) Escalation SLA
- P0 (tam kesinti/veri kaybı riski): 5 dk içinde bridge, 15 dk içinde mitigation plan
- P1 (kritik akış bozulması): 10 dk içinde bridge, 30 dk içinde workaround
- P2 (degrade ama servis ayakta): 30 dk içinde triage, 4 saat içinde kalıcı düzeltme planı

## 4) Deploy-Freeze Window
- Freeze başlangıç: T-24 saat
- Freeze bitiş: T+24 saat (stabilite sonrası)
- Freeze sırasında sadece IC onaylı hotfix

## 5) Rollback Plan
1. Son stabil Vercel deployment ID hazır tutulur.
2. Env rollback listesi hazır tutulur (DB/Redis/worker/webhook secrets).
3. Geri dönüş sırası:
   - app alias rollback
   - worker cron disable
   - webhook fallback endpoint switch (gerekirse)
4. Rollback sonrası zorunlu smoke:
   - health, exam flow, panel auth, worker noop

## 6) Cutover Checklist (Approval Gates)
- [ ] P0-1..P0-11 audit raporları PASS
- [ ] P0-10 dashboard + 19 alarm aktif
- [ ] SNS alarm subscription confirmed
- [ ] Turnstile secret active ve forms captcha zorunlu
- [ ] Panel MFA zorunlu ve admin login doğrulandı
- [ ] Queue DLQ replay doğrulandı
- [ ] Runbook ve rollback adımları dry-run edildi
- [ ] IC + Ops Lead + Backend Lead ortak onay verdi

## 7) Evidence Attachment List
- P0-9 topology audit JSON
- P0-10 observability audit JSON
- P0-11 certified load report JSON + signature
- Worker/webhook reconciliation sample logs
- Final deploy URL + timestamp
