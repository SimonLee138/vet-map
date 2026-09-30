-- Run this in Supabase SQL Editor after schema.sql.
-- Grants the Expo anon/authenticated roles read access while RLS limits rows.

BEGIN;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE
  public.clinics,
  public.clinic_opening_hours,
  public.clinic_services,
  public.clinic_fees,
  public.user_profiles,
  public.clinic_reviews,
  public.clinic_rating_summary
TO anon, authenticated;

GRANT INSERT, UPDATE ON TABLE public.user_profiles, public.clinic_reviews TO authenticated;

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active clinics" ON public.clinics;
CREATE POLICY "Public can read active clinics"
  ON public.clinics FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public can read active clinic hours" ON public.clinic_opening_hours;
CREATE POLICY "Public can read active clinic hours"
  ON public.clinic_opening_hours FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clinics c
    WHERE c.id = clinic_opening_hours.clinic_id AND c.is_active = TRUE
  ));

DROP POLICY IF EXISTS "Public can read active clinic services" ON public.clinic_services;
CREATE POLICY "Public can read active clinic services"
  ON public.clinic_services FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clinics c
    WHERE c.id = clinic_services.clinic_id AND c.is_active = TRUE
  ));

DROP POLICY IF EXISTS "Public can read active clinic fees" ON public.clinic_fees;
CREATE POLICY "Public can read active clinic fees"
  ON public.clinic_fees FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clinics c
    WHERE c.id = clinic_fees.clinic_id AND c.is_active = TRUE
  ));

DROP POLICY IF EXISTS "Public can read published reviews for active clinics" ON public.clinic_reviews;
CREATE POLICY "Public can read published reviews for active clinics"
  ON public.clinic_reviews FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_reviews.clinic_id AND c.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can read own profile or profile on published review" ON public.user_profiles;
CREATE POLICY "Users can read own profile or profile on published review"
  ON public.user_profiles FOR SELECT TO anon, authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.clinic_reviews r
      JOIN public.clinics c ON c.id = r.clinic_id
      WHERE r.user_id = user_profiles.user_id
        AND r.status = 'published'
        AND c.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- New user reviews are submitted for moderation, not published directly by clients.
DROP POLICY IF EXISTS "Users can submit own pending reviews" ON public.clinic_reviews;
CREATE POLICY "Users can submit own pending reviews"
  ON public.clinic_reviews FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.clinics c
      WHERE c.id = clinic_reviews.clinic_id AND c.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can edit own pending reviews" ON public.clinic_reviews;
CREATE POLICY "Users can edit own pending reviews"
  ON public.clinic_reviews FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) AND status = 'pending')
  WITH CHECK (user_id = (SELECT auth.uid()) AND status = 'pending');

COMMIT;
