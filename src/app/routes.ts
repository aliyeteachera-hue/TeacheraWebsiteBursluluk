import { createBrowserRouter, redirect } from 'react-router';
import type { ComponentType } from 'react';
import RootLayout from './components/RootLayout';
import { REDIRECT_ROUTE_MAP, SEO_LANDING_ROUTE_PATHS } from './routeManifest';

type ComponentModule = { default: ComponentType<any> };

const lazyComponent = (importer: () => Promise<ComponentModule>) => async () => {
  const module = await importer();
  return { Component: module.default };
};

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, lazy: lazyComponent(() => import('./components/LandingPage')) },
      { path: 'giris', lazy: lazyComponent(() => import('./components/AuthPage')) },
      { path: 'iletisim', lazy: lazyComponent(() => import('./components/ContactPage')) },
      { path: 'biz-kimiz', lazy: lazyComponent(() => import('./components/WhoWeAre')) },
      { path: 'fiyatlar', lazy: lazyComponent(() => import('./components/PricingPage')) },
      { path: 'academy', lazy: lazyComponent(() => import('./components/AcademyPage')) },
      { path: 'academy/:slug', lazy: lazyComponent(() => import('./components/ArticleDetailPage')) },
      { path: 'kurumsal', lazy: lazyComponent(() => import('./components/CorporatePage')) },
      { path: 'hukuki', lazy: lazyComponent(() => import('./components/legal/LegalDocumentsPage')) },
      { path: 'hukuki/:slug', lazy: lazyComponent(() => import('./components/legal/LegalDocumentPage')) },
      { path: 'metodoloji', lazy: lazyComponent(() => import('./components/MethodologyPage')) },
      { path: 'seviye-tespit-sinavi', lazy: lazyComponent(() => import('./components/PlacementExamPage')) },
      { path: 'speakup', lazy: lazyComponent(() => import('./components/SpeakUpPage')) },
      { path: 'konya-ingilizce-kursu', loader: () => redirect(REDIRECT_ROUTE_MAP['konya-ingilizce-kursu']) },
      ...SEO_LANDING_ROUTE_PATHS.map((path) => ({
        path,
        lazy: lazyComponent(() => import('./components/KonyaSeoLandingPage')),
      })),
      { path: 'is-firsatlari', lazy: lazyComponent(() => import('./components/JobOpportunitiesPage')) },
      { path: 'musteri-temsilcisi-ol', lazy: lazyComponent(() => import('./components/CustomerRepresentativePage')) },
      { path: 'elci-ol', lazy: lazyComponent(() => import('./components/AmbassadorPage')) },
      {
        path: 'egitimlerimiz',
        children: [
          { index: true, lazy: lazyComponent(() => import('./components/CoursesHub')) },

          // Dynamic program detail route — catches all :lang/:program combos
          { path: ':lang/:program', lazy: lazyComponent(() => import('./components/ProgramDetailPage')) },
        ],
      },
      {
        path: '*',
        lazy: lazyComponent(() => import('./components/NotFoundPage')),
      },
    ],
  },
]);
