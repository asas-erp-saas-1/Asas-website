'use client';
import { trackEvent, trackPageView } from './analytics';
import { useRouter } from './router';
import { useEffect, useRef } from 'react';

export function useAnalytics() {
  const { route } = useRouter();
  const prevPage = useRef<string>('');

  useEffect(() => {
    const pageName = route.page;
    if (pageName !== prevPage.current) {
      trackPageView(pageName, {
        project_slug: route.projectSlug,
        apartment_slug: route.apartmentSlug,
        campaign_slug: route.campaignSlug,
      });
      prevPage.current = pageName;
    }
  }, [route]);

  return { trackEvent, trackPageView };
}
