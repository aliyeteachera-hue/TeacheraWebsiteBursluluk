export const BURSLULUK_ROUTES = {
  landing: '/bursluluk-2026',
  confirmation: '/bursluluk/onay',
  login: '/bursluluk/giris',
  waiting: '/bursluluk/bekleme',
  exam: '/bursluluk/sinav',
  result: '/bursluluk/sonuc',
} as const;

export const BURSLULUK_SUPPORT = {
  phoneLabel: '0332 236 80 66',
  phoneHref: 'tel:03322368066',
  whatsappHref: 'https://wa.me/905528674226',
  whatsappLabel: 'WhatsApp Destek',
  supportWindow: 'Her gün 09:00 - 21:30',
} as const;

export const BURSLULUK_BADGES = [
  'Ücretsiz',
  'MEB Onaylı',
  'Online',
] as const;

export const BURSLULUK_TECHNICAL_CHECKLIST = [
  'Sınavdan önce kullanıcı adı ve şifrenizi not edin.',
  'Sınav saatinden 10 dakika önce giriş yapın.',
  'Telefon, tablet veya bilgisayardan katılım mümkündür.',
  'Kesintisiz internet bağlantısı ve güncel tarayıcı kullanın.',
  'Sınav sırasında yanıtlar otomatik olarak kaydedilir.',
] as const;

export const BURSLULUK_HERO_MESSAGES = [
  'Teachera Online Bursluluk Sınavı',
  'Teachera Dil Okulu’nun Milli Eğitim Bakanlığı onaylı online bursluluk sınavı ile Konya genelindeki tüm ilkokul, ortaokul ve lise öğrencilerine kapılarımızı açıyoruz. Katılım ücretsizdir. Detaylar için videoyu izleyebilirsiniz.',
] as const;

export const BURSLULUK_SCHOLARSHIP_ROWS = [
  { category: 'Katılım Bursu', rule: 'Sınava katılan her öğrenci', value: '%20 burs' },
  { category: 'Başarı Bursu', rule: 'Başarı oranı %70 ve üzeri', value: '%40 burs' },
  { category: 'Başarı Bursu', rule: 'Başarı oranı %80 ve üzeri', value: '%50 burs' },
  { category: 'Başarı Bursu', rule: 'Başarı oranı %90 ve üzeri', value: '%60 burs' },
  { category: 'Derece Bursu', rule: 'Her sınıf düzeyinde 1. olan toplam 10 öğrenci', value: '%100 burs' },
  { category: 'Derece Bursu', rule: 'Her sınıf düzeyinde 2. olan toplam 10 öğrenci', value: '%80 burs' },
  { category: 'Derece Bursu', rule: 'Her sınıf düzeyinde 3. ve 4. olan toplam 20 öğrenci', value: '%70 burs' },
] as const;

export const BURSLULUK_SCHOLARSHIP_NOTE =
  'Nihai burs oranı sonuç ekranında gösterilir ve kurum tarafından yapılacak son kontrol sonrası kesinleşir.';

export const BURSLULUK_FAQ_ITEMS = [
  {
    question: 'Sınav ücretli mi?',
    answer: 'Hayır. Başvuru ve katılım tamamen ücretsizdir.',
  },
  {
    question: 'Kimler katılabilir?',
    answer: 'Konya genelinde 1-12. sınıfta öğrenim gören tüm öğrenciler katılabilir.',
  },
  {
    question: 'Oturumu ben mi seçiyorum?',
    answer: 'Evet. Sınıfına uygun oturum seçeneklerinden birini başvuru sırasında seçebilirsin.',
  },
  {
    question: 'Sınav kaç dakika sürüyor?',
    answer: 'Sınav süresi 60 dakikadır. Soru sayısı sınıf kademesine göre değişebilir.',
  },
  {
    question: 'Başvuru sonrası ne oluyor?',
    answer: 'Başvurun tamamlanınca kullanıcı adı, şifre ve sınav giriş bilgin oluşturulur. Süreç SMS ile de paylaşılır.',
  },
  {
    question: 'Sonuçlar hemen açıklanacak mı?',
    answer: 'Hayır. Sonuçlar belirlenen açıklama anında toplu SMS ile duyurulacak ve aynı kullanıcı adı-şifre ile görüntülenecek.',
  },
  {
    question: 'Bağlantım koparsa ne olacak?',
    answer: 'Yanıtların otomatik kaydedilir. Yeniden giriş yaptığında uygun olduğu durumda kaldığın yerden devam edebilirsin.',
  },
  {
    question: 'Burs oranları toplanıyor mu?',
    answer: 'Hayır. Katılım, başarı ve derece avantajlarından yalnızca en yüksek oran uygulanır.',
  },
] as const;

export const BURSLULUK_PACKAGE_LADDER = [
  {
    id: 'core',
    title: 'Core Program',
    subtitle: 'Hızlı ve dengeli başlangıç',
    bullets: ['Haftalık canlı ders akışı', 'Düzenli ödev ve takip', 'Burs oranına göre fiyat avantajı'],
  },
  {
    id: 'accelerate',
    title: 'Accelerate Program',
    subtitle: 'Daha yoğun ilerleme isteyenler için',
    bullets: ['Ek pratik ve tekrar oturumları', 'Yakın takip ve mini performans kontrolleri', 'Okul temposuna uyarlanmış plan'],
  },
  {
    id: 'mastery',
    title: 'Mastery Program',
    subtitle: 'En yüksek hedefler için premium yapı',
    bullets: ['Yoğunlaştırılmış ders planı', 'Daha sık koçluk ve veli bilgilendirmesi', 'Hızlı sonuç odaklı premium deneyim'],
  },
] as const;

export const BURSLULUK_GRADE_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

export const BURSLULUK_SESSIONS = [
  {
    id: 'oturum-2026-03-28-10-primary',
    date: '2026-03-28',
    startsAt: '10:00',
    endsAt: '11:00',
    grades: [1, 2, 3, 4],
    label: '28 Mart 2026 · 10:00 - 11:00 · 1-4. sınıflar',
  },
  {
    id: 'oturum-2026-03-28-13-middle',
    date: '2026-03-28',
    startsAt: '13:00',
    endsAt: '14:00',
    grades: [5, 6, 7, 8],
    label: '28 Mart 2026 · 13:00 - 14:00 · 5-8. sınıflar',
  },
  {
    id: 'oturum-2026-03-28-15-high',
    date: '2026-03-28',
    startsAt: '15:00',
    endsAt: '16:00',
    grades: [9, 10, 11, 12],
    label: '28 Mart 2026 · 15:00 - 16:00 · 9-12. sınıflar',
  },
  {
    id: 'oturum-2026-03-29-10-high',
    date: '2026-03-29',
    startsAt: '10:00',
    endsAt: '11:00',
    grades: [9, 10, 11, 12],
    label: '29 Mart 2026 · 10:00 - 11:00 · 9-12. sınıflar',
  },
  {
    id: 'oturum-2026-03-29-15-primary',
    date: '2026-03-29',
    startsAt: '15:00',
    endsAt: '16:00',
    grades: [2, 3, 4],
    label: '29 Mart 2026 · 15:00 - 16:00 · 2-4. sınıflar',
  },
  {
    id: 'oturum-2026-03-29-17-middle',
    date: '2026-03-29',
    startsAt: '17:00',
    endsAt: '18:00',
    grades: [5, 6, 7, 8],
    label: '29 Mart 2026 · 17:00 - 18:00 · 5-8. sınıflar',
  },
] as const;

export const BURSLULUK_RESULT_RELEASE = {
  title: 'Sonuçlar SMS ile açıklanacaktır',
  summary:
    'Sınav sonuçları tek seferde toplu olarak duyurulur. SMS geldiğinde aynı kullanıcı adı ve şifre ile tekrar giriş yaparak burs sonucunu görüntüleyebilirsin.',
} as const;
