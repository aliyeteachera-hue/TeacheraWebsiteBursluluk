# Open-Source Karşılaştırma Özeti (2026-03-13)

Bu doküman, Teachera bursluluk/seviye tespit projesinin teknik requirement’larının open-source ve resmi iyi-pratik referanslarıyla karşılaştırılmış özetidir.

## Örtüşen Kısımlar
1. Katmanlı mimari: `Exam Application` + `Core Services` + `Admin Panel`.
2. Çekirdek servis ayrımı: Auth, Exam Engine, Notification, Results, Reporting.
3. Asenkron bildirim yaklaşımı: queue/worker tabanlı pipeline + DLQ mantığı.
4. Kalıcı veritabanı: PostgreSQL/Aurora odaklı tasarım.
5. Cache/session/rate-limit için Redis kullanımı.
6. Object storage + CDN ile medya/statik içerik dağıtımı.
7. Operasyonel gözlemlenebilirlik: logging, metrics, alarms, dashboard yaklaşımı.
8. 10k+ ölçek için load balancing ve API katmanı ayrımı.

## Farklılıklar
1. Detay seviyesi:
- Teknik DOCX dosyaları route, tablo, API sözleşmesi, güvenlik kontrolleri ve go-live adımlarını detaylandırıyor.
- JPEG mimari diyagramları daha çok bileşen/topoloji seviyesinde.
2. Veri modeli görünürlüğü:
- DOCX tabloları (campaigns, applications, exam_attempts, notification_jobs vb.) net veriyor.
- JPEG veri modeline inmiyor.
3. Güvenlik derinliği:
- DOCX MFA, RBAC, brute-force, PII koruma, audit log gibi kontrolleri açık yazıyor.
- JPEG’de bunlar açıkça etiketlenmiyor.
4. Operasyon süreçleri:
- DOCX retry/backoff, DLQ replay, runbook, rollback, war-room gibi süreçleri veriyor.
- JPEG sadece mimari blokları gösteriyor.

## Çelişen / Netleştirilmesi Gereken Noktalar
1. Domain topolojisi standardı:
- Bazı akışlar `teachera.com.tr` altında birleşik route gösteriyor.
- Bazı planlar `www/exam-api/panel-api/ops-api` ayrımını hedefliyor.
- Tek bir “as-built” kararı dokümanda sabitlenmeli.
2. Queue teknolojisi hedefi:
- Yer yer `SQS` net hedef, yer yer `SQS/RabbitMQ/Kafka` alternatifli ifade var.
- Operasyon ve maliyet için tek teknoloji standardı seçilmeli.
3. Retry stratejisi:
- Sabit schedule yaklaşımı var (1m/5m/15m/60m/6h).
- Open-source/saha pratiği jitter’lı exponential backoff öneriyor.

## Önerilenler
1. **Tek hedef topoloji**: “as-designed vs as-built” ayrımını bitirip tek canonical mimariyi resmi referans yap.
2. **Queue standardizasyonu**: Üretimde yalnızca seçilen queue teknolojisini (öneri: SQS + DLQ) dokümana kilitle.
3. **Retry iyileştirmesi**: Mevcut retry planını korurken jitter ekle (thundering herd riskini azaltır).
4. **Idempotency standardı**: webhook, submit, notification enqueue uçlarında idempotency key zorunlu olsun.
5. **SLO/Error budget**: p95/p99, error-rate ve queue-lag için açık error-budget policy yayınla.
6. **DR kanıtı**: PITR/restore drill çıktıları düzenli ve imzalı kanıt olarak saklansın.
7. **Doküman senkronu**: Route/endpoint/tablo değişikliklerinde canonical doküman otomatik güncellensin.

## Referans Kümeleri (Karşılaştırma Bazı)
- AWS Well-Architected Framework
- AWS SQS + DLQ best practices
- AWS retry/backoff + jitter önerileri
- OWASP ASVS / API Security Top 10
- NIST SP 800-63B (kimlik doğrulama)
- Google SRE SLO/error-budget yaklaşımı

---

Not: Bu dosya, operasyonel karar toplantısında hızlı hizalama amacıyla özet formatta hazırlanmıştır.
