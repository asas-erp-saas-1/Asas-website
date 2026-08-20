'use client';

type AnalyticsEvent =
  | 'page_view'
  | 'project_view'
  | 'project_card_click'
  | 'apartment_view'
  | 'apartment_cta_click'
  | 'floorplan_open'
  | 'gallery_open'
  | 'whatsapp_click'
  | 'phone_click'
  | 'form_start'
  | 'form_submit'
  | 'form_success'
  | 'form_failure'
  | 'developer_form_submit'
  | 'favorite_add'
  | 'favorite_remove'
  | 'compare_add'
  | 'compare_remove'
  | 'compare_open'
  | 'compare_share'
  | 'recently_viewed_add'
  | 'recently_viewed_clear'
  | 'ai_search'
  | 'campaign_view'
  | 'campaign_cta_click'
  | 'newsletter_subscribe'
  | 'newsletter_unsubscribe'
  | 'brochure_download'
  | 'theme_toggle';

interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}

/**
 * GA4 + Meta Pixel compatible event tracking.
 * Safe to call from any client component — no-ops when tags are not loaded.
 */
export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  // GA4 compatible event tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, payload);
  }

  // Meta Pixel compatible
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, payload);
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, payload);
  }
}

export function trackPageView(pageName: string, payload: AnalyticsPayload = {}) {
  trackEvent('page_view', { page_title: pageName, ...payload });
}
