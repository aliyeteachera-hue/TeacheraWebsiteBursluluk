# Güvenli Smoke Hesabı + Secret Hygiene Politikası

Tarih: 2026-03-17  
Kapsam: `panel-api` tam-auth smoke testleri, CI/CD, Vercel production secret yönetimi.

## 1) Admin MFA zorunludur (kapatılamaz)
- Panel kullanıcıları (özellikle `SUPER_ADMIN`, `OPERATIONS`, `READ_ONLY`) MFA ile doğrulanır.
- Smoke test için de MFA bypass kullanılmaz; sadece TOTP üretimi otomasyonda yapılır.
- Uygulama kuralı: MFA zorunluluğunu düşüren değişiklikler release blocker kabul edilir.

## 2) Ayrı OPERATIONS smoke hesabı kullanılmalıdır
- Smoke testler production operasyon hesabından değil, ayrı bir `OPERATIONS` smoke hesabından çalışır.
- Hesap adı önerisi: `ops-smoke-panel@teachera.com.tr`.
- Hesap sadece test amacıyla kullanılır; insan operatör hesabıyla paylaşılmaz.

## 3) TOTP kodu sadece pipeline’da üretilir, saklanmaz
- `PANEL_MFA_CODE` kalıcı secret olarak saklanmaz.
- Kalıcı secret olarak sadece `PANEL_SMOKE_TOTP_SECRET` tutulur.
- TOTP kodu test anında üretilir (`frontend:uat:rc` scripti bunu runtime’da üretir).
- Secret değerleri terminal çıktısına/loglara yazdırılmaz.

## 4) optional-admin-check modeli (candidate release’i bloklamaz)
- `frontend:uat:rc` içinde panel full-auth adımları `optional-admin-check` olarak etiketlenir.
- Aday akışı (landing/form/start/answer/submit/result) fail etmediği sürece RC `overall_ready_for_release_candidate=true` kalır.
- Panel kimlik doğrulama adımları görünür olarak raporlanır; ancak candidate release kapısını tek başına kapatmaz.

## 5) Haftalık rotasyon zorunludur
- Smoke hesabı secret’ları haftada 1 kez rotasyona alınır:
  - `PANEL_PASSWORD`
  - `PANEL_SMOKE_TOTP_SECRET`
- Rotasyon sonrası CI/Vercel secret’ları güncellenir ve `frontend:uat:rc` yeniden koşturulur.
- Rotasyon kanıtı olarak tarih damgalı audit kaydı tutulur.

## CI Bağlantısı (Zorunlu)
- GitHub Actions secret isimleri:
  - `PANEL_EMAIL`
  - `PANEL_PASSWORD`
  - `PANEL_SMOKE_TOTP_SECRET`
- CI workflow env:
  - `REQUIRE_PANEL_FULL_AUTH=true`
- Bu kombinasyon ile pipeline, panel full-auth smoke adımlarını zorunlu çalıştırır.

## Uygulama Komutları (Kısa)

```bash
# 1) Smoke hesabını güvenli şekilde rotate et (secretlar /tmp dosyasına 600 izinle yazılır)
cd "/Users/aliye/Downloads/Teachera Website Bursluluk"
set -a; source ./.env.production.local; set +a
npm run panel:smoke:rotate -- --email ops-smoke-panel@teachera.com.tr --name "Ops Smoke Panel" --out-file /tmp/panel-smoke-account-secrets-latest.json

# 2) /tmp dosyasından secret manager'a gir (terminale echo etme), sonra RC smoke
export PANEL_EMAIL='...'
export PANEL_PASSWORD='...'
export PANEL_SMOKE_TOTP_SECRET='...'
npm run frontend:uat:rc
```
