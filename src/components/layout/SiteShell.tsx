'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
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

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 2 },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <StoreHydration />
      <div className="flex min-h-screen min-w-0 w-full flex-col overflow-x-clip bg-background">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-forest focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium">
          Aller au contenu principal
        </a>
        <Navbar />
        <ScrollProgress />
        <BackToTop />
        <main id="main-content" className="min-w-0 flex-1">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <Footer />
        <StickyMobileCTA />
        <ContactFloatingWidget />
        <CompareBar />
        <CompareModal />
        <ToastContainer />
        <SearchCommandPalette />
      </div>
      <CookieConsent />
    </QueryClientProvider>
  );
}
