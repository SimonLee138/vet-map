-- Vet Map PostgreSQL schema
-- Compatible with PostgreSQL 14+ and Supabase PostgreSQL.

BEGIN;

CREATE TABLE IF NOT EXISTS clinics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  is_open_24_hours BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_exotic_pets BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ISO weekday numbers: Monday = 1, Sunday = 7.
CREATE TABLE IF NOT EXISTS clinic_opening_hours (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  opens_at TIME NOT NULL,
  closes_at TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (is_closed OR opens_at <> closes_at),
  UNIQUE (clinic_id, weekday)
);

CREATE TABLE IF NOT EXISTS clinic_services (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, name)
);

CREATE TABLE IF NOT EXISTS clinic_fees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'HKD',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, service_name)
);

-- Populate this table from the application's authentication provider.
-- Never store passwords here; use an authentication service (such as Supabase Auth).
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinic_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (length(trim(comment)) BETWEEN 1 AND 1000),
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('pending', 'published', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, user_id)
);

CREATE INDEX IF NOT EXISTS clinics_active_name_idx
  ON clinics (name) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS clinic_hours_lookup_idx
  ON clinic_opening_hours (weekday, opens_at, closes_at, clinic_id)
  WHERE is_closed = FALSE;
CREATE INDEX IF NOT EXISTS clinic_services_name_idx
  ON clinic_services (name, clinic_id);
CREATE INDEX IF NOT EXISTS clinic_reviews_published_idx
  ON clinic_reviews (clinic_id, created_at DESC)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS clinic_reviews_user_idx
  ON clinic_reviews (user_id, created_at DESC);

CREATE OR REPLACE VIEW clinic_rating_summary AS
SELECT
  clinic_id,
  ROUND(AVG(rating)::NUMERIC, 1) AS average_rating,
  COUNT(*)::INTEGER AS review_count
FROM clinic_reviews
WHERE status = 'published'
GROUP BY clinic_id;

COMMIT;
