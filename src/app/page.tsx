'use client';

import { useRouter, type AppRoute } from '@/lib/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { StickyMobileCTA } from '@/components/layout/StickyMobileCTA';
import { ScrollProgress } from '@/components/shared/ScrollProgress';
import { BackToTop } from '@/components/shared/BackToTop';
import { CompareBar } from '@/components/shared/CompareBar';
import { CompareModal } from '@/components/shared/CompareModal';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { SearchCommandPalette } from '@/components/shared/SearchCommandPalette';
import { StoreHydration } from '@/components/shared/StoreHydration';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { CookieConsent } from '@/components/shared/CookieConsent';
import { ContactFloatingWidget } from '@/components/shared/ContactFloatingWidget';

// Lazy load page components
const HomePage = lazy(() => import('@/components/pages/HomePage'));
const ProjectsPage = lazy(() => import('@/components/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/components/pages/ProjectDetailPage'));
const ApartmentDetailPage = lazy(() => import('@/components/pages/ApartmentDetailPage'));
const ServicesPage = lazy(() => import('@/components/pages/ServicesPage'));
const AboutPage = lazy(() => import('@/components/pages/AboutPage'));
const ForDevelopersPage = lazy(() => import('@/components/pages/ForDevelopersPage'));
const ContactPage = lazy(() => import('@/components/pages/ContactPage'));
const InsightsPage = lazy(() => import('@/components/pages/InsightsPage'));
const CampaignLandingPage = lazy(() => import('@/components/pages/CampaignLandingPage'));
const PrivacyPage = lazy(() => import('@/components/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/components/pages/TermsPage'));
const AdminPage = lazy(() => import('@/components/pages/AdminPage'));
const NotFoundPage = lazy(() => import('@/components/pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-ivory">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-forest border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

function routeKey(route: AppRoute): string {
  return `${route.page}-${route.projectSlug ?? ''}-${route.apartmentSlug ?? ''}-${route.campaignSlug ?? ''}`;
}

function Router() {
  const { route } = useRouter();

  return (
    <Suspense fallback={<PageLoader />}>
      {route.page === 'home' && <HomePage />}
      {route.page === 'projects' && <ProjectsPage />}
      {route.page === 'project' && route.projectSlug && (
        <ProjectDetailPage projectSlug={route.projectSlug} />
      )}
      {route.page === 'apartment' && route.projectSlug && route.apartmentSlug && (
        <ApartmentDetailPage
          projectSlug={route.projectSlug}
          apartmentSlug={route.apartmentSlug}
        />
      )}
      {route.page === 'services' && <ServicesPage />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'for-developers' && <ForDevelopersPage />}
      {route.page === 'contact' && <ContactPage />}
      {route.page === 'insights' && <InsightsPage />}
      {route.page === 'campaign' && route.campaignSlug && (
        <CampaignLandingPage campaignSlug={route.campaignSlug} />
      )}
      {route.page === 'privacy' && <PrivacyPage />}
      {route.page === 'terms' && <TermsPage />}
      {route.page === 'admin' && <AdminPage />}
      {route.page === 'not-found' && <NotFoundPage />}
    </Suspense>
  );
}

export default function Home() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const { route } = useRouter();
  const syncFromHash = useRouter(s => s.syncFromHash);

  // Sync the router from window.location.hash AFTER mount. This guarantees
  // the first client render matches the SSR'd HTML (both { home }), and any
  // direct navigation to /#/projects etc. is then applied to the live store.
  useEffect(() => {
    syncFromHash();
  }, [syncFromHash]);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreHydration />
      <div className="min-h-screen flex flex-col bg-background">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium">
          Aller au contenu principal
        </a>
        <Navbar />
        <ScrollProgress />
        <BackToTop />
        <div id="main-content" className="flex-1">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              <motion.div
                key={routeKey(route)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Router />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </div>
        <Footer />
        <StickyMobileCTA />
        <ContactFloatingWidget />
        {/* Global CompareBar (appears when 2+ items in comparison) */}
        <CompareBar />
        {/* Global CompareModal (controlled by UI store, triggered from CompareBar or FavoritesDrawer) */}
        <CompareModal />
        <ToastContainer />
        {/* Global Search Command Palette (Cmd/Ctrl+K) */}
        <SearchCommandPalette />
      </div>
      {/* GDPR Cookie Consent Banner */}
      <CookieConsent />
    </QueryClientProvider>
  );
}
