export const EXAM_BANKS = {
  primary: [
    { id: 'p-001', prompt: '“Apple” hangi meyvedir?', options: ['Elma', 'Armut', 'Muz', 'Çilek'], answer: 'Elma' },
    { id: 'p-002', prompt: '“Blue” hangi renktir?', options: ['Mavi', 'Kırmızı', 'Sarı', 'Yeşil'], answer: 'Mavi' },
    { id: 'p-003', prompt: '“Good morning” hangi anlama gelir?', options: ['Günaydın', 'İyi geceler', 'Hoşça kal', 'Teşekkürler'], answer: 'Günaydın' },
    { id: 'p-004', prompt: '“Cat” hangi hayvandır?', options: ['Kedi', 'Kuş', 'Balık', 'Köpek'], answer: 'Kedi' },
    { id: 'p-005', prompt: '“School” hangi kelimedir?', options: ['Okul', 'Ev', 'Park', 'Araba'], answer: 'Okul' },
    { id: 'p-006', prompt: '“One, two, ...” dizisinde sıradaki sayı hangisidir?', options: ['Three', 'Five', 'Seven', 'Ten'], answer: 'Three' },
    { id: 'p-007', prompt: '“Book” hangi nesnedir?', options: ['Kitap', 'Kalem', 'Silgi', 'Defter'], answer: 'Kitap' },
    { id: 'p-008', prompt: '“Thank you” hangi anlama gelir?', options: ['Teşekkür ederim', 'Lütfen', 'Affedersiniz', 'Merhaba'], answer: 'Teşekkür ederim' },
  ],
  middle: [
    { id: 'm-001', prompt: 'She ___ to school every day.', options: ['goes', 'go', 'going', 'gone'], answer: 'goes' },
    { id: 'm-002', prompt: 'We ___ basketball yesterday.', options: ['played', 'play', 'plays', 'playing'], answer: 'played' },
    { id: 'm-003', prompt: 'Which word is a fruit?', options: ['Orange', 'Chair', 'Window', 'Pencil'], answer: 'Orange' },
    { id: 'm-004', prompt: 'My brother is ___ than me.', options: ['taller', 'tall', 'more tall', 'tallest'], answer: 'taller' },
    { id: 'm-005', prompt: 'There ___ two books on the table.', options: ['are', 'is', 'was', 'be'], answer: 'are' },
    { id: 'm-006', prompt: 'I am interested ___ music.', options: ['in', 'on', 'at', 'for'], answer: 'in' },
    { id: 'm-007', prompt: 'Choose the correct question.', options: ['Where do you live?', 'Where you live?', 'Do where you live?', 'Live you where?'], answer: 'Where do you live?' },
    { id: 'm-008', prompt: '“Careful” kelimesine en yakın anlam hangisidir?', options: ['Dikkatli', 'Hızlı', 'Üzgün', 'Gürültülü'], answer: 'Dikkatli' },
  ],
  high: [
    { id: 'h-001', prompt: 'If I ___ more time, I would join the club.', options: ['had', 'have', 'will have', 'having'], answer: 'had' },
    { id: 'h-002', prompt: 'The book ___ by thousands of students every year.', options: ['is read', 'reads', 'read', 'is reading'], answer: 'is read' },
    { id: 'h-003', prompt: 'Choose the sentence with the correct meaning of “although”.', options: ['Although it was raining, we went out.', 'Although it was raining because we went out.', 'Although we went out so it was raining.', 'Although raining went out we.'], answer: 'Although it was raining, we went out.' },
    { id: 'h-004', prompt: '“Achievement” kelimesine en yakın Türkçe karşılık hangisidir?', options: ['Başarı', 'Deneme', 'Davranış', 'Merak'], answer: 'Başarı' },
    { id: 'h-005', prompt: 'She asked me where I ___.', options: ['lived', 'live', 'am living', 'will live'], answer: 'lived' },
    { id: 'h-006', prompt: 'By the time we arrived, the film ___.', options: ['had started', 'has started', 'started', 'was starting'], answer: 'had started' },
    { id: 'h-007', prompt: 'Choose the best connector: “He studied hard; ___, he passed the exam.”', options: ['therefore', 'unless', 'although', 'meanwhile'], answer: 'therefore' },
    { id: 'h-008', prompt: 'Which sentence is grammatically correct?', options: ['Neither of the answers is correct.', 'Neither of the answers are correct.', 'Neither answers is correct.', 'Neither answer are correct.'], answer: 'Neither of the answers is correct.' },
  ],
};

export function getExamBankKeyForGrade(grade) {
  const numeric = Number(grade);
  if (numeric >= 1 && numeric <= 4) return 'primary';
  if (numeric >= 5 && numeric <= 8) return 'middle';
  return 'high';
}

export function getExamBankForGrade(grade) {
  return EXAM_BANKS[getExamBankKeyForGrade(grade)];
}
