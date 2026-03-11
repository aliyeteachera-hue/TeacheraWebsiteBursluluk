import { describe, expect, it } from 'vitest';
import { isKnownPath, resolveMeta, toKeywordCase } from './SeoManager';

describe('SeoManager helpers', () => {
  it('normalizes slug words for keyword phrases', () => {
    expect(toKeywordCase('grup-programi')).toBe('grup programi');
    expect(toKeywordCase('  birebir-ozel-ders  ')).toBe('birebir ozel ders');
  });

  it('detects known static and dynamic paths', () => {
    expect(isKnownPath('/')).toBe(true);
    expect(isKnownPath('/biz-kimiz')).toBe(true);
    expect(isKnownPath('/academy/hedef-dilde-dusunmek')).toBe(true);
    expect(isKnownPath('/egitimlerimiz/ingilizce/grup-programi')).toBe(true);
    expect(isKnownPath('/hukuki/gizlilik-politikasi')).toBe(true);
    expect(isKnownPath('/olmayan-sayfa')).toBe(false);
  });

  it('resolves program detail meta from language and program slugs', () => {
    const meta = resolveMeta('/egitimlerimiz/ingilizce/grup-programi');

    expect(meta.title).toBe('İngilizce Kursu Konya | İngilizce grup programi | Teachera');
    expect(meta.description).toContain('İngilizce program detayları');
    expect(meta.keywords).toContain('konya ingilizce kursu');
    expect(meta.keywords).toContain('İngilizce grup programi teachera');
  });

  it('resolves legal detail and falls back to base meta', () => {
    const legalMeta = resolveMeta('/hukuki/kvkk');
    expect(legalMeta.title).toBe('Hukuki Doküman | Teachera');

    const fallbackMeta = resolveMeta('/olmayan-sayfa');
    expect(fallbackMeta.title).toBe('Teachera Dil Okulu Konya | Konuşma Odaklı Yabancı Dil Eğitimi');
  });
});
