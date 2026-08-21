'use client';

import { useEffect, lazy, Suspense } from 'react';
import { useRouter } from '@/lib/router';
import { SiteShell } from '@/components/layout/SiteShell';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

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

function LegacyRouter() {
  const { route } = useRouter();
  return (
    <Suspense fallback={<PageLoader />}>
      {route.page === 'home' && <HomePage />}
      {route.page === 'projects' && <ProjectsPage />}
      {route.page === 'project' && route.projectSlug && <ProjectDetailPage projectSlug={route.projectSlug} />}
      {route.page === 'apartment' && route.projectSlug && route.apartmentSlug && (
        <ApartmentDetailPage projectSlug={route.projectSlug} apartmentSlug={route.apartmentSlug} />
      )}
      {route.page === 'services' && <ServicesPage />}
      {route.page === 'about' && <AboutPage />}
      {route.page === 'for-developers' && <ForDevelopersPage />}
      {route.page === 'contact' && <ContactPage />}
      {route.page === 'insights' && <InsightsPage />}
      {route.page === 'campaign' && route.campaignSlug && <CampaignLandingPage campaignSlug={route.campaignSlug} />}
      {route.page === 'privacy' && <PrivacyPage />}
      {route.page === 'terms' && <TermsPage />}
      {route.page === 'admin' && <AdminPage />}
      {route.page === 'not-found' && <NotFoundPage />}
    </Suspense>
  );
}

export default function Home() {
  const syncFromLocation = useRouter((state) => state.syncFromLocation);

  useEffect(() => {
    syncFromLocation();
  }, [syncFromLocation]);

  return (
    <SiteShell>
      <ErrorBoundary>
        <LegacyRouter />
      </ErrorBoundary>
    </SiteShell>
  );
}
