/**
 * Public lead-submission contract.
 *
 * This is intentionally separate from the Prisma Lead persistence model.
 * Client components should submit this transport shape to /api/leads and
 * must not import database/domain records into the browser.
 */
export interface Lead {
  name: string;
  phone: string;
  email?: string;
  preferredContact?: string;
  intent: string;
  message?: string;
  projectId?: string;
  projectName?: string;
  apartmentId?: string;
  apartmentName?: string;
  pageUrl?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  source?: string;
  /** Honeypot field. Never persisted when non-empty; server silently blocks it. */
  website?: string;
}
