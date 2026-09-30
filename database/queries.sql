-- Common queries used by the Vet Map UI.
-- Run schema.sql first. Parameters use PostgreSQL positional notation ($1, $2, ...).

-- 1) Search clinics and apply the UI filters.
-- $1 search text (nullable or empty)
-- $2 only 24-hour clinics (boolean)
-- $3 only clinics that handle exotic animals (boolean)
-- $4 only clinics open now (boolean)
-- Hours are evaluated in Hong Kong local time.
SELECT
  c.id,
  c.name,
  c.address,
  c.phone,
  c.latitude,
  c.longitude,
  c.is_open_24_hours,
  c.accepts_exotic_pets,
  COALESCE(r.average_rating, 0) AS rating,
  COALESCE(r.review_count, 0) AS review_count
FROM clinics AS c
LEFT JOIN clinic_rating_summary AS r ON r.clinic_id = c.id
WHERE c.is_active = TRUE
  AND (
    NULLIF(trim($1::TEXT), '') IS NULL
    OR c.name ILIKE '%' || trim($1::TEXT) || '%'
    OR COALESCE(c.address, '') ILIKE '%' || trim($1::TEXT) || '%'
    OR EXISTS (
      SELECT 1 FROM clinic_services AS s
      WHERE s.clinic_id = c.id
        AND s.name ILIKE '%' || trim($1::TEXT) || '%'
    )
  )
  AND ($2::BOOLEAN IS NOT TRUE OR c.is_open_24_hours = TRUE)
  AND ($3::BOOLEAN IS NOT TRUE OR c.accepts_exotic_pets = TRUE)
  AND (
    $4::BOOLEAN IS NOT TRUE
    OR c.is_open_24_hours = TRUE
    OR EXISTS (
      SELECT 1
      FROM clinic_opening_hours AS h
      WHERE h.clinic_id = c.id
        AND h.is_closed = FALSE
        AND (
          (h.weekday = EXTRACT(ISODOW FROM (now() AT TIME ZONE 'Asia/Hong_Kong'))::SMALLINT
           AND h.opens_at < h.closes_at
           AND (now() AT TIME ZONE 'Asia/Hong_Kong')::TIME >= h.opens_at
           AND (now() AT TIME ZONE 'Asia/Hong_Kong')::TIME < h.closes_at)
          OR
          (h.weekday = EXTRACT(ISODOW FROM (now() AT TIME ZONE 'Asia/Hong_Kong'))::SMALLINT
           AND h.opens_at > h.closes_at
           AND (now() AT TIME ZONE 'Asia/Hong_Kong')::TIME >= h.opens_at)
          OR
          (h.weekday = CASE
             WHEN EXTRACT(ISODOW FROM (now() AT TIME ZONE 'Asia/Hong_Kong'))::SMALLINT = 1 THEN 7
             ELSE EXTRACT(ISODOW FROM (now() AT TIME ZONE 'Asia/Hong_Kong'))::SMALLINT - 1
           END
           AND h.is_closed = FALSE
           AND h.opens_at > h.closes_at
           AND (now() AT TIME ZONE 'Asia/Hong_Kong')::TIME < h.closes_at)
        )
    )
  )
ORDER BY c.name;

-- 2) List clinics near a coordinate (Haversine distance, kilometres).
-- $1 latitude, $2 longitude, $3 max distance in km.
WITH origin AS (
  SELECT radians($1::DOUBLE PRECISION) AS lat,
         radians($2::DOUBLE PRECISION) AS lon
), distances AS (
  SELECT
    c.*,
    6371 * 2 * asin(sqrt(
      power(sin((radians(c.latitude) - origin.lat) / 2), 2)
      + cos(origin.lat) * cos(radians(c.latitude))
      * power(sin((radians(c.longitude) - origin.lon) / 2), 2)
    )) AS distance_km
  FROM clinics AS c
  CROSS JOIN origin
  WHERE c.is_active = TRUE
)
SELECT id, name, address, phone, latitude, longitude, distance_km
FROM distances
WHERE distance_km <= $3::DOUBLE PRECISION
ORDER BY distance_km;

-- 3) Get a clinic profile with aggregate published review rating.
-- $1 clinic id.
SELECT
  c.*,
  COALESCE(r.average_rating, 0) AS average_rating,
  COALESCE(r.review_count, 0) AS review_count
FROM clinics AS c
LEFT JOIN clinic_rating_summary AS r ON r.clinic_id = c.id
WHERE c.id = $1 AND c.is_active = TRUE;

-- 4) Fetch clinic services and fees.
-- $1 clinic id.
SELECT name AS service_name
FROM clinic_services
WHERE clinic_id = $1
ORDER BY name;

SELECT service_name, amount, currency
FROM clinic_fees
WHERE clinic_id = $1
ORDER BY service_name;

-- 5) Fetch published comments, newest first.
-- $1 clinic id, $2 page size, $3 offset.
SELECT
  r.id,
  p.display_name AS reviewer,
  r.rating,
  r.comment,
  r.created_at
FROM clinic_reviews AS r
JOIN user_profiles AS p ON p.user_id = r.user_id
WHERE r.clinic_id = $1
  AND r.status = 'published'
ORDER BY r.created_at DESC
LIMIT $2 OFFSET $3;

-- 6) Submit or update the current user's review.
-- Supply the authenticated user's UUID as $1; never accept it from an untrusted client
-- without verifying it against the auth provider.
-- $1 user id, $2 clinic id, $3 rating (1..5), $4 comment.
INSERT INTO clinic_reviews (user_id, clinic_id, rating, comment, status)
VALUES ($1, $2, $3, trim($4), 'published')
ON CONFLICT (clinic_id, user_id) DO UPDATE SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment,
  status = 'published',
  updated_at = now()
RETURNING id, clinic_id, rating, comment, created_at, updated_at;
