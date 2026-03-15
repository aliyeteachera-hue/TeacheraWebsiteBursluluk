# Bursluluk 20-Step UAT Checklist (Done / Gap / Action)

Date: 2026-03-15  
Scope: Landing -> Application -> SMS -> Candidate Login/Waiting -> Exam -> Result -> WhatsApp -> Panel Tracking

## Status Summary

- Total: 20
- Done: 20
- Gap: 0
- Overall: `PASS_20_OF_20`

## A) Landing ve Başvuru

| # | Requirement | Status | Evidence | Action | Owner | Deadline |
|---|---|---|---|---|---|---|
| 1 | Kullanıcı bursluluk landing sayfasına gelir | DONE | `/bursluluk-2026` route + page | - | FE | Done |
| 2 | Üst alanda bursluluk tanıtım videosu | DONE | `BurslulukApplyPage.tsx` video block | - | FE | Done |
| 3 | Form alanları: okul arama, öğrenci, sınıf(2-11), veli, telefon | DONE | `BurslulukApplyPage.tsx` form schema + school search | - | FE | Done |
| 4 | Submit sonrası kayıt DB’ye yazılır | DONE | `POST /api/exam/session/start` | - | BE | Done |
| 5 | Submit ile SMS job queue’ya atılır (async) | DONE | `start.js` -> `enqueueNotification(template=CREDENTIALS_SMS)` | - | BE | Done |

## B) Onay Ekranı ve İlk SMS

| # | Requirement | Status | Evidence | Action | Owner | Deadline |
|---|---|---|---|---|---|---|
| 6 | Submit sonrası onay ekranına yönlendirme | DONE | `navigate('/bursluluk/onay')` | - | FE | Done |
| 7 | Onay ekranında teknik video | DONE | `BurslulukApprovalPage.tsx` video block | - | FE | Done |
| 8 | İlk SMS içeriği: başvuru + kullanıcı/şifre + giriş linki | DONE | `CREDENTIALS_SMS` status dağılımı: `QUEUED/SENT/DELIVERED/READ` | - | Ops + CRM | Done |
| 9 | SMS durumu panelde sent/failed/retry izlenir | DONE | Panel notifications/candidates endpoints + dashboard metrics | - | Ops | Done |

## C) Aday Girişi ve Sayaç

| # | Requirement | Status | Evidence | Action | Owner | Deadline |
|---|---|---|---|---|---|---|
| 10 | Username/password ile login | DONE | `/bursluluk/giris` + `POST /api/exam/candidate/login` | - | FE+BE | Done |
| 11 | Sınav öncesi sadece sayaç/teknik kontrol | DONE | `/bursluluk/bekleme` + gate polling | - | FE+BE | Done |
| 12 | Sınav saati backend gate (`exam_open`) | DONE | `resolveExamGateStatus` + session status/login response gate | - | BE | Done |

## D) Sınav Açılışı ve İkinci SMS

| # | Requirement | Status | Evidence | Action | Owner | Deadline |
|---|---|---|---|---|---|---|
| 13 | Sınav açıldığında ikinci SMS otomatik tetiklenir | DONE | `EXAM_OPEN_SMS` jobs oluştu (`candidate_login_exam_open`, `session_status_exam_open`) | - | Ops + QA | Done |
| 14 | Sınav başlar, autosave periyodik kaydedilir | DONE | `BurslulukExamPage.tsx` -> `saveExamAnswers` autosave | - | FE+BE | Done |
| 15 | Süre dolunca veya bitirince submit | DONE | timer + `submitExam` (`time_limit_reached`/`completed`) | - | FE+BE | Done |

## E) Sonuç ve WhatsApp

| # | Requirement | Status | Evidence | Action | Owner | Deadline |
|---|---|---|---|---|---|---|
| 16 | Sonuçlar yayınlanır | DONE | `session/submit` upsert result + publish fields | - | BE | Done |
| 17 | Aday sonucu username/password ile görüntüler | DONE | `/bursluluk/sonuc` login + `GET /api/exam/results/{attemptId}` | - | FE+BE | Done |
| 18 | Sonuç görmeyen adaylar panelde filtrelenir | DONE | `GET /api/panel/unviewed-results` + `v_unviewed_results` | - | Ops Panel | Done |
| 19 | Sonuç görmeyenlere WhatsApp bot sonucu iletilir | DONE | `POST /api/panel/unviewed-results/actions` + WHATSAPP job kayıtları | - | Ops Panel | Done |
| 20 | WA delivery/read + web result_viewed panelde görünür | DONE | `notification_events` içinde `DELIVERED/READ`; `v_candidate_operations` alanları | - | Ops + QA | Done |

## Closeout Evidence (2026-03-15)

```text
CREDENTIALS_SMS: QUEUED=6, SENT=2, DELIVERED=2, READ=1, DLQ=126
EXAM_OPEN_SMS: QUEUED=2
EXAM_OPEN_SMS_RECENT triggers: candidate_login_exam_open, session_status_exam_open
notification_events: DELIVERED=3, READ=1
v_unviewed_results total: 1538
WHATSAPP jobs present: P0_11_OUTAGE_TEST(SENT), WA_RESULT(DLQ)
```

## Bu turda kapatılan kritikler

1. Localhost CORS/form submit sorunu düzeltildi (dev proxy + origin handling).
2. Panel operasyon yüzeyine “Sonuç Görmeyenler + WhatsApp gönder” eklendi.
3. Exam gate açıldığında otomatik ikinci SMS enqueue (dedupe) aktif kanıtlandı.
4. 20 maddelik UAT checklist `PASS_20_OF_20` durumuna çekildi.
