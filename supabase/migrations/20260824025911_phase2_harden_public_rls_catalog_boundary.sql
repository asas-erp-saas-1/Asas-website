-- ASAS Phase 2: harden the public catalog boundary.
-- Applied to the connected Supabase project as migration
-- 20260824025911 / phase2_harden_public_rls_catalog_boundary.
--
-- Public catalog rows must be explicitly published and non-archived.
-- Administrative tables remain closed to public roles.

DROP POLICY IF EXISTS projects_public_read ON public.projects;
CREATE POLICY projects_public_read ON public.projects
  AS PERMISSIVE FOR SELECT
  TO anon, authenticated
  USING (published = true AND archived = false);

DROP POLICY IF EXISTS apartments_public_read ON public.apartments;
CREATE POLICY apartments_public_read ON public.apartments
  AS PERMISSIVE FOR SELECT
  TO anon, authenticated
  USING (published = true AND archived = false);

DROP POLICY IF EXISTS media_public_read ON public.media;
CREATE POLICY media_public_read ON public.media
  AS PERMISSIVE FOR SELECT
  TO anon, authenticated
  USING (
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = media.project_id
        AND p.published = true
        AND p.archived = false
    ))
    OR
    (apartment_id IS NOT NULL AND EXISTS (
      SELECT 1
      FROM public.apartments a
      JOIN public.projects p ON p.id = a.project_id
      WHERE a.id = media.apartment_id
        AND a.published = true
        AND a.archived = false
        AND p.published = true
        AND p.archived = false
    ))
  );

DROP POLICY IF EXISTS newsletter_public_update ON public.newsletter_subscriptions;
REVOKE UPDATE ON public.newsletter_subscriptions FROM anon, authenticated;
REVOKE DELETE ON public.newsletter_subscriptions FROM anon, authenticated;
