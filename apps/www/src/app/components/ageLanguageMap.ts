/* ─── Yaş–Dil Eşleştirme Tablosu ──────────────────────────────────────── */
// Her iki modal (Ücretsiz Deneme Seansı & Seviye Tespit) bu tabloyu kullanır.

export const allLanguages = [
  { id: 'en', name: 'İngilizce' },
  { id: 'es', name: 'İspanyolca' },
  { id: 'de', name: 'Almanca' },
  { id: 'fr', name: 'Fransızca' },
  { id: 'it', name: 'İtalyanca' },
  { id: 'ru', name: 'Rusça' },
  { id: 'ar', name: 'Arapça' },
];

export const ageRanges = ['7–12', '13–17', '18–24', '25–34', '35–44', '45–54', '55+'];

/**
 * Yaş aralığına göre sunulan dil ID'leri.
 * – 7–12  : İngilizce, Almanca, İspanyolca
 * – 13–17 : Tüm diller
 * – 18+   : Tüm diller
 */
const languagesByAge: Record<string, string[]> = {
  '7–12':  ['en', 'de', 'es'],
  '13–17': ['en', 'es', 'de', 'fr', 'it', 'ru', 'ar'],
  '18–24': ['en', 'es', 'de', 'fr', 'it', 'ru', 'ar'],
  '25–34': ['en', 'es', 'de', 'fr', 'it', 'ru', 'ar'],
  '35–44': ['en', 'es', 'de', 'fr', 'it', 'ru', 'ar'],
  '45–54': ['en', 'es', 'de', 'fr', 'it', 'ru', 'ar'],
  '55+':   ['en', 'es', 'de', 'fr', 'it', 'ru', 'ar'],
};

/** Seçilen yaş aralığına göre kullanılabilir dilleri döndürür. */
export function getLanguagesForAge(age: string) {
  const ids = languagesByAge[age];
  if (!ids) return [];
  return allLanguages.filter((l) => ids.includes(l.id));
}
