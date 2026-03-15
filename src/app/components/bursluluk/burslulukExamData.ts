export type BurslulukSection = 'LISTENING' | 'READING' | 'REASONING' | 'WRITING';

export interface BurslulukQuestion {
  id: string;
  section: BurslulukSection;
  prompt: string;
  options: string[];
  answer: string;
  media?: {
    type: 'image' | 'audio';
    src: string;
    caption: string;
  };
}

const WAVES_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='960' height='240' viewBox='0 0 960 240'>
      <rect width='960' height='240' fill='#0b1220'/>
      <g fill='none' stroke='#38bdf8' stroke-width='4' opacity='0.95'>
        <path d='M0 120 Q30 40 60 120 T120 120 T180 120 T240 120 T300 120 T360 120 T420 120 T480 120 T540 120 T600 120 T660 120 T720 120 T780 120 T840 120 T900 120 T960 120'/>
      </g>
      <text x='40' y='212' fill='#e2e8f0' font-size='24' font-family='Arial'>Listening track waveform preview</text>
    </svg>`,
  );

export const BURSLULUK_QUESTION_COUNT = 20;
export const BURSLULUK_EXAM_DURATION_SECONDS = 40 * 60;

export const burslulukQuestions: BurslulukQuestion[] = [
  {
    id: 'L-01',
    section: 'LISTENING',
    prompt: 'Dinleme kaydına göre öğrenciler saat kaçta toplanıyor?',
    options: ['08:15', '08:30', '08:45', '09:00'],
    answer: '08:30',
    media: { type: 'image', src: WAVES_IMAGE, caption: 'Dinleme kaydı dalga formu (örnek).' },
  },
  {
    id: 'L-02',
    section: 'LISTENING',
    prompt: 'Konuşmada belirtilen etkinlik nerede yapılacak?',
    options: ['Kütüphane', 'Spor salonu', 'Konferans salonu', 'Laboratuvar'],
    answer: 'Konferans salonu',
  },
  {
    id: 'L-03',
    section: 'LISTENING',
    prompt: 'Öğretmen öğrencilere hangi materyali getirmelerini istiyor?',
    options: ['Dizüstü bilgisayar', 'Kulaklık', 'Sözlük', 'Tablet'],
    answer: 'Kulaklık',
  },
  {
    id: 'L-04',
    section: 'LISTENING',
    prompt: 'Anonsun ana amacı nedir?',
    options: ['Sınav tarihini ertelemek', 'Sınav saatini duyurmak', 'Sınıf değişikliği yapmak', 'Ödev vermek'],
    answer: 'Sınav saatini duyurmak',
  },
  {
    id: 'L-05',
    section: 'LISTENING',
    prompt: 'Kayıtta geçen cümleyi en iyi tamamlayan ifade hangisi?',
    options: ['Please switch off your phones', 'Please close your books', 'Please check your microphones', 'Please open the main gate'],
    answer: 'Please switch off your phones',
  },
  {
    id: 'R-01',
    section: 'READING',
    prompt: '“The scholarship exam is open to students from grades 2 to 11.” cümlesine göre hangisi doğrudur?',
    options: ['Sadece lise öğrencileri katılır', '2-11 sınıflar katılabilir', 'Sadece 8. sınıf katılır', 'Sadece Konya dışı öğrenciler katılır'],
    answer: '2-11 sınıflar katılabilir',
  },
  {
    id: 'R-02',
    section: 'READING',
    prompt: 'Metinde “mandatory” kelimesinin en yakın anlamı hangisidir?',
    options: ['Optional', 'Required', 'Late', 'Unknown'],
    answer: 'Required',
  },
  {
    id: 'R-03',
    section: 'READING',
    prompt: '“Candidates must log in with the credentials sent by SMS.” cümlesi neyi zorunlu kılar?',
    options: ['Yeni hesap oluşturmayı', 'SMS ile gelen bilgiyle giriş yapmayı', 'Sadece WhatsApp kullanmayı', 'Panel hesabı açmayı'],
    answer: 'SMS ile gelen bilgiyle giriş yapmayı',
  },
  {
    id: 'R-04',
    section: 'READING',
    prompt: 'Aşağıdakilerden hangisi metnin ana fikridir?',
    options: ['Kayıtlar manuel yapılıyor', 'Sınav akışı dijital ve aşamalıdır', 'Sonuçlar açıklanmaz', 'Bildirim yoktur'],
    answer: 'Sınav akışı dijital ve aşamalıdır',
  },
  {
    id: 'R-05',
    section: 'READING',
    prompt: '“retry/backoff” ifadesi operasyonel olarak ne anlatır?',
    options: ['Hata sonrası tekrar deneme stratejisi', 'Sınavı iptal etme', 'Veriyi silme', 'Formu yeniden tasarlama'],
    answer: 'Hata sonrası tekrar deneme stratejisi',
  },
  {
    id: 'RS-01',
    section: 'REASONING',
    prompt: 'Bir aday 20 sorunun 15’ini doğru yaptı. Yüzdesi kaçtır?',
    options: ['65', '70', '75', '80'],
    answer: '75',
  },
  {
    id: 'RS-02',
    section: 'REASONING',
    prompt: 'Queue sistemi neden kritik?',
    options: ['UI rengini değiştirir', 'Bildirimleri anlık yükten ayırır', 'Şifreyi gizler', 'Video oynatır'],
    answer: 'Bildirimleri anlık yükten ayırır',
  },
  {
    id: 'RS-03',
    section: 'REASONING',
    prompt: 'Aynı anda 10.000 kullanıcı varken hangi yaklaşım daha güvenlidir?',
    options: ['In-memory tek sunucu', 'DB + Redis + queue + worker', 'Sadece local json', 'Sadece browser storage'],
    answer: 'DB + Redis + queue + worker',
  },
  {
    id: 'RS-04',
    section: 'REASONING',
    prompt: 'Rate-limit neden uygulanır?',
    options: ['Sayfayı hızlandırmak için animasyon', 'Kötüye kullanım ve brute-force’u sınırlamak', 'Logo değiştirmek', 'Video kalitesini düşürmek'],
    answer: 'Kötüye kullanım ve brute-force’u sınırlamak',
  },
  {
    id: 'RS-05',
    section: 'REASONING',
    prompt: 'PII encryption hangi riski azaltır?',
    options: ['UI tutarsızlığı', 'Kişisel verinin açık okunması', 'Buton boyutu', 'DNS gecikmesi'],
    answer: 'Kişisel verinin açık okunması',
  },
  {
    id: 'W-01',
    section: 'WRITING',
    prompt: 'Aşağıdaki cümleyi en doğru tamamlayan seçenek hangisi? “I ____ my exam before the deadline.”',
    options: ['submit', 'submitted', 'submits', 'submitting'],
    answer: 'submitted',
  },
  {
    id: 'W-02',
    section: 'WRITING',
    prompt: '“If I ____ enough time, I will review all answers.”',
    options: ['have', 'had', 'will have', 'having'],
    answer: 'have',
  },
  {
    id: 'W-03',
    section: 'WRITING',
    prompt: 'Hangi ifade resmi sınav iletişimine daha uygundur?',
    options: ['Hey, send me results now', 'Could you please share the result status?', 'Yo, where is my score?', 'I need it asap bro'],
    answer: 'Could you please share the result status?',
  },
  {
    id: 'W-04',
    section: 'WRITING',
    prompt: '“The candidate ____ waiting screen until exam opens.”',
    options: ['see', 'sees', 'seeing', 'seen'],
    answer: 'sees',
  },
  {
    id: 'W-05',
    section: 'WRITING',
    prompt: 'Doğru noktalama hangisidir?',
    options: ['Login submit results', 'Login, submit, and view results.', 'Login submit, and view results', 'Login; submit and view results'],
    answer: 'Login, submit, and view results.',
  },
];

export function getBurslulukQuestions() {
  return burslulukQuestions.slice(0, BURSLULUK_QUESTION_COUNT).map((question) => ({
    ...question,
    options: [...question.options],
  }));
}
