# PostgreSQL database starter

These scripts model the clinic finder and clinic-review features currently present in the app.

## Setup

Run in order against a PostgreSQL database:

1. `schema.sql` — creates clinic, hours, services, fees, profile, and review tables plus a rating-summary view.
2. `seed.sql` — inserts the four prototype clinics and their services, fees, and opening hours.
3. Use `queries.sql` as a reference for search/filter, distance, clinic detail, fee, review-list, and review-upsert queries.

For example, with `psql` connected to the target database, run the schema and seed files using `\i database/schema.sql` and `\i database/seed.sql`.

### Connect the Expo app to Supabase

1. Create a Supabase project and run `schema.sql`, `seed.sql`, and `policies.sql` in its SQL editor (or via `psql`).
2. Copy `.env.example` to `.env` in the project root.
3. Set `EXPO_PUBLIC_SUPABASE_URL` to the Project URL and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the project's publishable/anon key. These are client-side public values; never use a `service_role` key in Expo.
4. `policies.sql` grants read access and enables Row Level Security policies for active clinics and their related public data. Run it after the schema; otherwise PostgREST reports errors such as `permission denied for table clinics`.
5. Restart Expo after changing environment variables. The home map loads its clinic records from Supabase on screen start.

## Model mapping

- `clinics.id` uses the existing slug IDs in `src/data/clinics.ts`.
- Clinic service chips come from `clinic_services`.
- Optional fee rows come from `clinic_fees`; a clinic with no rows has no fee section.
- `clinic_opening_hours` stores normalized weekly hours using ISO weekdays (Monday 1 through Sunday 7). The current frontend's `openingHours` display string can be built from those rows.
- Current ratings are derived from published rows in `clinic_reviews`, not stored as an editable clinic field.
- `clinic_reviews` requires an authenticated profile. Create the matching `user_profiles` row after a user signs up with your authentication provider.

`src/data/clinic-reviews.ts` contains explicitly labeled UI preview comments only. They are intentionally not seeded as real customer reviews. The current `submitReview` function is also a stub; connect it to a trusted backend/API before production. Do not put database credentials or a privileged service key in the Expo client.

## Security before production

If using Supabase, enable Row Level Security on all public tables and add policies so that:

- Anyone can read active clinics, services, fees, opening hours, rating summaries, and published reviews.
- Only authenticated users can insert or update their own profile/review.
- Users cannot set another user's ID, publish pending reviews, or change clinic records.

For plain PostgreSQL, expose parameterized queries through a server API rather than connecting directly from the mobile/web app.
