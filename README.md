# Teachera - Premium Dil Eğitimi Platformu

Modern, minimal ve premium bir dil eğitimi web uygulaması. React, Motion (Framer Motion) ve Tailwind CSS kullanılarak geliştirilmiştir.

## ✨ Özellikler

### 🎨 Tasarım & UX
- **Premium Animasyonlar**: Motion (Framer Motion) ile smooth, profesyonel animasyonlar
- **Minimal & Modern**: Temiz, kullanıcı dostu arayüz
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Smooth Scroll**: Yumuşak sayfa geçişleri
- **Micro-interactions**: Hover effects, transitions ve delightful details

### 🚀 Teknik Özellikler
- **React 18**: Modern React hooks ve best practices
- **Motion/React**: Premium animasyon kütüphanesi
- **Tailwind CSS v4**: Utility-first CSS framework
- **TypeScript**: Type-safe kod
- **Lucide Icons**: Modern, özelleştirilebilir iconlar

### 📱 Bileşenler
- **LoadingScreen**: Animasyonlu yükleme ekranı
- **Navigation**: Sticky, animated navigation bar
- **MobileMenu**: Full-screen mobile menü
- **Hero**: Parallax effectli hero section
- **HowItWorks**: Feature kartları
- **Methodology**: Premium içerik gösterimi
- **Programs**: Dil programları grid
- **Gallery**: Masonry-style görsel galeri
- **FAQ**: Animated accordion FAQ
- **Footer**: Comprehensive footer

## 🎯 İyileştirmeler

### Orijinal Tasarımdan Yapılan İyileştirmeler

1. **Animasyonlar**
   - Loading screen animasyonu
   - Scroll-based parallax effects
   - Smooth section transitions
   - Hover micro-animations
   - Stagger animations for lists

2. **UX İyileştirmeleri**
   - Active section highlighting
   - Smooth scroll to section
   - Interactive FAQ accordion
   - Enhanced button states
   - Mobile-first responsive design

3. **Performance**
   - Optimized component structure
   - Lazy loading ready
   - Efficient re-renders
   - Modern CSS with Tailwind v4

4. **Accessibility**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Focus states

## 🛠 Geliştirme

### Kurulum
```bash
pnpm install
```

### Çalıştırma
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

## 🧩 Online Sınav Backend (V1)

Bu repo artık seviye tespit/bursluluk operasyonu için backend endpoint’lerini içerir.

### Migration
`db/migrations/*.sql` dosyaları aşağıdaki tabloları ve panel view’larını oluşturur/günceller:
- `campaigns`, `schools`, `guardians`, `candidates`, `applications`
- `exam_attempts`, `exam_answers`, `exam_session_tokens`, `results`
- `notification_jobs`, `notification_events`, `dlq_jobs`, `activity_events`, `app_settings`
- `notification_webhook_inbox` (webhook reconciliation için)
- panel performansı için `v_candidate_operations`, `v_notifications`, `v_unviewed_results` view’ları

Uygulama:
```bash
npm run db:migrate
```
`db:migrate` script’i `db/migrations/*.sql` dosyalarını sırayla uygular.

Panel admin bootstrap:
```bash
npm run panel:generate-totp-secret
npm run panel:create-admin -- --email admin@teachera.com --name "Panel Admin" --password "StrongPassword!" --role SUPER_ADMIN --totp-secret "<BASE32_SECRET>"
```

### API Uçları
- `POST /api/exam/session/start`
- `POST /api/exam/session/answer`
- `POST /api/exam/session/submit`
- `GET /api/exam/results/:attemptId`
- `GET /api/panel/dashboard`
- `GET /api/panel/candidates`
- `GET /api/panel/candidates/export`
- `POST /api/panel/candidates/actions`
- `GET /api/panel/notifications`
- `POST /api/panel/notifications/actions`
- `GET /api/panel/unviewed-results`
- `POST /api/panel/unviewed-results/actions`
- `GET /api/panel/dlq`
- `POST /api/panel/dlq/actions`
- `GET|PUT /api/panel/settings`
- `POST /api/panel/auth/login`
- `GET /api/panel/auth/me`
- `POST /api/panel/auth/logout`
- `GET /api/panel/audit`
- `POST /api/notifications/worker`
- `POST /api/notifications/provider-webhook`
- `GET|POST /api/notifications/dlq-replay`
- `GET|POST /api/ops/observability/collect`
- `GET /api/health`

### Frontend Entegrasyonu
`src/app/components/PlacementExamPage.tsx` dosyası artık sınav oturumunu backend’den başlatır ve submit işlemini
`/api/exam/session/submit` ile tamamlar.

### Ölçekleme Notu (10.000 aday)
- DB sorguları sözleşme kolonlarına göre indekslenmiştir.
- Bildirimler `notification_jobs` + worker akışı ile asenkron işlenir.
- Retry/backoff politikası: `1m -> 5m -> 15m -> 60m -> 6h`, ardından DLQ.
- Eşleşmeyen provider callback’leri `notification_webhook_inbox` tablosuna alınır; worker her koşuda reconcile eder.
- Retry / DLQ yönetimi panel aksiyonlarıyla desteklenir.
- API’ler sayfalama (`page`, `per_page`) ve filtreli listeleme sözleşmesine uyumludur.
- Sonuç görüntüleme durumu yalnızca aday sonucu açtığında `VIEWED` olur (panel görüntülemesi işaretlemez).

### Worker / Cron
- `api/notifications/worker` artık `GET` ve `POST` kabul eder.
- Vercel cron her dakika worker’ı çağıracak şekilde `vercel.json` içinde tanımlıdır.
- Güvenlik için `NOTIFICATION_WORKER_SECRET` veya `CRON_SECRET` set edilmelidir.
- Provider webhook endpoint’i HMAC-SHA256 signature doğrular (`NOTIFICATION_PROVIDER_WEBHOOK_SIGNING_SECRET`).
- Manuel tetikleme örneği:
```bash
curl -X POST "https://teachera.com.tr/api/notifications/worker?limit=100&reconcile_limit=100&worker_secret=YOUR_SECRET"
```

### Panel Auth (P0-6 Hardened)
- Panel uçları artık client-provided role/header ile yetkilendirme yapmaz.
- Kimlik doğrulama sadece server-signed session token ile yapılır (Bearer veya HttpOnly cookie).
- Session claim’leri: `sub`, `sid`, `role`, `mfa`, `iat`, `exp`.
- Token doğrulama sonrası DB’de `admin_sessions` + `admin_users` kontrolü yapılır.
- MFA zorunludur: `/api/panel/auth/login` çağrısında geçerli TOTP kodu gerekir.
- `PANEL_API_KEYS` modeli kaldırılmıştır.

### Anti-Abuse (P0-7)
- Kritik uçlarda Redis-backed rate limit fail-open değildir; Redis yoksa istek `503` ile reddedilir.
- Brute-force koruması:
  - Panel login: IP + email bazlı fail counter/lock
  - Exam session auth: IP + token fingerprint bazlı fail counter/lock
  - Forms: IP + contact bazlı fail counter/lock
- Turnstile server doğrulaması zorunludur:
  - `TURNSTILE_SECRET_KEY` yoksa `/api/forms` istekleri `503 turnstile_not_configured` döner.
  - Geçersiz/eksik token `403 captcha_failed` döner.

### PII Protection + Audit (P0-8)
- PII alanları (öğrenci/veli ad-soyad, veli telefon/e-posta) artık şifreli kolonlarda tutulur:
  - `candidates.full_name_enc`, `candidates.full_name_hash`
  - `guardians.full_name_enc`, `guardians.phone_e164_enc`, `guardians.email_enc`, `guardians.phone_e164_hash`
- Şifreleme modeli KMS-backed data-key envelope yapısıdır:
  - `PII_KMS_ENCRYPTED_DATA_KEY_B64`, `PII_KMS_REGION`, `PII_KMS_KEY_ID`
  - lookup/dedupe için `PII_LOOKUP_HMAC_KEY`
- Panelde PII erişimi role-scoped:
  - `SUPER_ADMIN`, `OPERATIONS`: full PII
  - `READ_ONLY`: masked PII
- Audit log append-only + hash-chain:
  - `audit_log_entries`, `audit_log_chain_head`
  - update/delete trigger ile engellenir
  - panel operasyonları actor-bound olarak zincire yazılır

Backfill (mevcut plain PII satırlarını şifreli alana taşı + redakte et):
```bash
npm run p0:backfill-pii -- --limit 1000
```

### P0-9 Speed Run (Infra Topology Audit)
- Time-saving quality bundle:
```bash
npm run p0:quick
```
- Consolidated topology audit (boundaries + managed infra evidence):
```bash
npm run p0:topology:audit -- --http --aws
```
- Autodiscover + audit (single command, fastest):
```bash
npm run p0:topology:autodiscover
```
- Required topology spec:
  - `guidelines/p0-9-target-topology-10k-15k.md`

### P0-10 Speed Run (Observability + SLO Alarms)
- Dashboard + alarm seti oluştur/güncelle:
```bash
npm run p0:observability:provision
```
- Collector endpoint + AWS kaynak doğrulama:
```bash
npm run p0:observability:audit -- --http --aws
```
- Tek komutlu hızlı P0-10 akışı:
```bash
npm run p0:observability:all
```
- Kılavuz:
  - `guidelines/p0-10-observability-slo.md`

Collector endpoint:
- `GET|POST /api/ops/observability/collect` (CRON_SECRET/Bearer auth)
- Vercel cron ile 5 dakikada bir tetiklenir (`vercel.json`).

### P0-11 Speed Run (Certified Load + Resilience)
- Tek komutta burst + outage + backlog recovery + signed report:
```bash
npm run p0:load-resilience:certify
```
- İmza doğrulama:
```bash
npm run p0:load-resilience:verify-signature
```
- Tek satır full akış:
```bash
npm run p0:load-resilience:all
```
- Üretilen dosyalar:
  - `guidelines/p0-11-load-resilience-report-latest.json`
  - `guidelines/p0-11-load-resilience-report-latest.md`
- Kılavuz:
  - `guidelines/p0-11-load-resilience-certification.md`

## 📂 Proje Yapısı

```
src/
├── app/
│   ├── components/
│   │   ├── LoadingScreen.tsx
│   │   ├── Navigation.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Methodology.tsx
│   │   ├── Programs.tsx
│   │   ├── Gallery.tsx
│   │   ├── FAQ.tsx
│   │   └── Footer.tsx
│   └── App.tsx
├── styles/
│   ├── fonts.css
│   ├── theme.css
│   └── index.css
└── imports/ (Figma assets)
```

## 🎨 Renk Paleti

- **Primary Red**: #E51E25
- **Dark Green**: #334E48
- **Black**: #09090F
- **Light Beige**: #F3EBD1
- **Off White**: #EEEBF5

## 🔤 Fontlar

- **Neutraface 2 Text**: Primary font family
- **Retro Signature**: Decorative headings
- **Luxury Diamond/Gold**: Special titles

## 📝 Notlar

- Tüm bileşenler modern React patterns kullanır
- Motion animasyonları performans için optimize edilmiştir
- Figma'dan import edilen assetler korunmuştur
- Custom font'lar CDN üzerinden yüklenir

## 🚀 Gelecek İyileştirmeler

- [ ] Dark mode support
- [ ] i18n (çoklu dil desteği)
- [ ] Blog section
- [ ] Student dashboard
- [ ] Booking system integration
- [ ] Real-time chat support
- [ ] Video testimonials
- [ ] Interactive level test

---

**Teachera** - Konuşarak Öğren 🗣️
