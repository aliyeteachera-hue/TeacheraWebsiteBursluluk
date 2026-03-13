import { describe, expect, it } from 'vitest';
import {
  REDIRECT_ROUTE_MAP,
  SEO_LANDING_ROUTE_PATHS,
  STATIC_ROUTE_PATHS,
  isKnownAppRoutePath,
} from './routeManifest';

describe('route manifest', () => {
  it('keeps SEO landing paths unique and routable', () => {
    expect(new Set(SEO_LANDING_ROUTE_PATHS).size).toBe(SEO_LANDING_ROUTE_PATHS.length);

    for (const path of SEO_LANDING_ROUTE_PATHS) {
      expect(isKnownAppRoutePath(`/${path}`)).toBe(true);
      expect(STATIC_ROUTE_PATHS).toContain(`/${path}`);
    }
  });

  it('defines redirect source and target', () => {
    expect(REDIRECT_ROUTE_MAP['konya-ingilizce-kursu']).toBe('/egitimlerimiz/ingilizce/grup-programi');
  });

  it('matches known dynamic route patterns and rejects unknown paths', () => {
    expect(isKnownAppRoutePath('/academy/hedef-dilde-dusunmek')).toBe(true);
    expect(isKnownAppRoutePath('/hukuki/cerez-politikasi')).toBe(true);
    expect(isKnownAppRoutePath('/egitimlerimiz/ingilizce/grup-programi')).toBe(true);
    expect(isKnownAppRoutePath('/yok/boyle/bir/route')).toBe(false);
  });

  it('keeps document-compatible bursluluk and panel route aliases routable', () => {
    expect(isKnownAppRoutePath('/bursluluk/giris')).toBe(true);
    expect(isKnownAppRoutePath('/bursluluk/onay')).toBe(true);
    expect(isKnownAppRoutePath('/bursluluk/bekleme')).toBe(true);
    expect(isKnownAppRoutePath('/bursluluk/sinav')).toBe(true);
    expect(isKnownAppRoutePath('/bursluluk/sonuc')).toBe(true);
    expect(isKnownAppRoutePath('/panel/inbox')).toBe(true);
    expect(isKnownAppRoutePath('/panel/candidates')).toBe(true);
    expect(isKnownAppRoutePath('/panel/notifications')).toBe(true);
    expect(isKnownAppRoutePath('/panel/dlq')).toBe(true);
    expect(isKnownAppRoutePath('/panel/settings')).toBe(true);
  });
});
