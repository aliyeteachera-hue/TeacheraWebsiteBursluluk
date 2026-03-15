# Frontend Contract Checklist (Bursluluk 2026)

Status: Draft v1 (must-have contract before implementation freeze)
Owner: Product + Frontend + Backend + Ops
Scope: `www.teachera.com.tr`, `exam.teachera.com.tr`, `api.teachera.com.tr`, `panel.teachera.com.tr`

## 1) Must-have Screens (Frontend)
1. `/bursluluk-2026` landing: tanitim/video + CTA
2. `/bursluluk/giris`: basvuru formu + aday girisi (username/password)
3. `/bursluluk/onay`: basvuru alindi + teknik bilgilendirme videosu
4. `/bursluluk/bekleme`: sinav acilisina geri sayim + teknik kontrol
5. `/bursluluk/sınav`: soru akisi + autosave + timer + submit
6. `/bursluluk/sonuç`: sonuc goruntuleme + result viewed isareti
7. `/panel/login`, `/panel/dashboard`: operasyon takip yüzeyi

## 2) Must-have API Contracts (No frontend guesswork)
1. `POST /api/exam/session/start`
- Input: okul, ogrenci, sinif(2-11), veli, telefon, consent version
- Output: `applicationNo`, `attemptId`, `sessionToken`, `credentialsSmsStatus`
2. `POST /api/exam/session/submit`
- Input: `attemptId`, answers, metrics, completion status
- Output: `result_id`, score/percentage, publish state
3. `GET /api/exam/results/:attemptId`
- Auth: candidate session token
- Output: score, placement, viewed/status fields
4. `POST /api/panel/auth/login` + `GET /api/panel/auth/me`
- MFA zorunlu, reset-required sinyali destekli
5. `GET /api/panel/dashboard`, `/api/panel/candidates`, `/api/panel/notifications`, `/api/panel/dlq`
6. Notification ops:
- Worker: `POST /api/notifications/worker`
- Webhook: `POST /api/notifications/provider-webhook`
7. Missing-contract (go-live oncesi netlesmeli):
- `GET /api/schools/search?q=` (Konya okul arama)
- `POST /api/exam/candidate/login` (username/password ile session recover)
- `GET /api/exam/session/status` (`exam_open`, `countdown_target`)

## 3) Must-have State Model (Frontend)
1. `ApplicationDraft`
- school, student, grade, guardian, phone, consentVersion
2. `CandidateSession`
- applicationNo, attemptId, sessionToken, expiresAt, examOpenAt, language/age
3. `ExamRuntimeState`
- questions, answers, remainingSeconds, autosaveSnapshotAt
4. `ResultState`
- published|pending, viewed, score, placement, resultViewedAt
5. `OpsState` (panel)
- sms/wa status buckets, queue lag, dlq counters, unviewed results

## 4) Must-have UX/Flow Guards
1. Giris -> Bekleme gecisi candidate session yoksa bloklanir
2. Bekleme -> Sinav gecisi `exam_open=true` olmadan bloklanir
3. Sinav autosave periyodik ve sayfa kapanisinda fail-safe
4. Sonuc ekrani auth/session olmadan acilamaz
5. Panel route'lari auth + role + MFA olmadan acilamaz

## 5) Must-have Non-functional Frontend Constraints
1. API base hostlar env tabanli (`VITE_EXAM_API_BASE`, `VITE_PANEL_API_BASE`, `VITE_OPS_API_BASE`)
2. Captcha server validation zorunlu (fallback yok)
3. Rate-limit/brute-force mesajlari UX tarafinda anlamli gösterilir
4. Mobile-first ve dusuk bant genisliginde calisir (video lazy, critical UI first paint)
5. Hata ekranlari operatoru aksiyona yonlendiren metinler icerir

## 6) Go-live Definition of Done (Frontend slice)
1. Yukaridaki 6 aday ekrani prod route olarak acik
2. Start -> bekleme -> sinav -> submit -> sonuc E2E smoke PASS
3. Panel login -> dashboard smoke PASS
4. API host boundary smoke PASS (wrong host 4xx, correct host 2xx/401)
5. Evidence artifact guncel (`p0:evidence:gate`) PASS
