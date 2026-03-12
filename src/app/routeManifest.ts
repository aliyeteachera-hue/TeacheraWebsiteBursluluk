export const SEO_LANDING_ROUTE_PATHS = [
  'konya-speaking-club',
  'konya-online-dil-kursu',
  'turkiye-online-dil-kursu',
] as const;

export const REDIRECT_ROUTE_MAP = {
  'konya-ingilizce-kursu': '/egitimlerimiz/ingilizce/grup-programi',
} as const;

export const STATIC_ROUTE_PATHS = [
  '/',
  '/giris',
  '/iletisim',
  '/biz-kimiz',
  '/fiyatlar',
  '/academy',
  '/kurumsal',
  '/hukuki',
  '/metodoloji',
  '/seviye-tespit-sinavi',
  '/bursluluk-2026',
  '/panel/login',
  '/speakup',
  '/is-firsatlari',
  '/musteri-temsilcisi-ol',
  '/elci-ol',
  '/egitimlerimiz',
  '/konya-ingilizce-kursu',
  ...SEO_LANDING_ROUTE_PATHS.map((path) => `/${path}`),
] as const;

const DYNAMIC_ROUTE_PATTERNS = [
  /^\/academy\/[^/]+$/,
  /^\/hukuki\/[^/]+$/,
  /^\/egitimlerimiz\/[^/]+\/[^/]+$/,
];

export function isKnownAppRoutePath(pathname: string) {
  if (STATIC_ROUTE_PATHS.includes(pathname as (typeof STATIC_ROUTE_PATHS)[number])) {
    return true;
  }

  return DYNAMIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}
