-- Seed the four prototype clinics. Safe to re-run: records are upserted.
BEGIN;

INSERT INTO clinics (id, name, address, phone, latitude, longitude, is_open_24_hours, accepts_exotic_pets)
VALUES
  ('buddys-animal-medical-center', 'Buddy''s Animal Medical Center', 'Kowloon, Hong Kong', '+852 2345 6789', 22.339347563319834, 114.15269326513197, FALSE, TRUE),
  ('central-animal-hospital', 'Central Animal Hospital', 'Central, Hong Kong', '+852 2123 4567', 22.2819, 114.1582, FALSE, FALSE),
  ('petcare-247', 'PetCare 24/7', 'Mong Kok, Hong Kong', '+852 2987 6543', 22.3193, 114.1694, TRUE, FALSE),
  ('happy-paws-veterinary-clinic', 'Happy Paws Veterinary Clinic', 'Sha Tin, Hong Kong', '+852 2678 9012', 22.3771, 114.1953, FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  is_open_24_hours = EXCLUDED.is_open_24_hours,
  accepts_exotic_pets = EXCLUDED.accepts_exotic_pets,
  updated_at = now();

INSERT INTO clinic_services (clinic_id, name)
VALUES
  ('buddys-animal-medical-center', 'General consultation'),
  ('buddys-animal-medical-center', 'Vaccinations'),
  ('buddys-animal-medical-center', 'Dental care'),
  ('buddys-animal-medical-center', 'Exotic pet care'),
  ('central-animal-hospital', 'General consultation'),
  ('central-animal-hospital', 'Vaccinations'),
  ('central-animal-hospital', 'Surgery'),
  ('central-animal-hospital', 'Dental care'),
  ('petcare-247', 'Emergency care'),
  ('petcare-247', 'General consultation'),
  ('petcare-247', 'Diagnostics'),
  ('happy-paws-veterinary-clinic', 'General consultation'),
  ('happy-paws-veterinary-clinic', 'Vaccinations'),
  ('happy-paws-veterinary-clinic', 'Exotic pet care')
ON CONFLICT (clinic_id, name) DO NOTHING;

INSERT INTO clinic_fees (clinic_id, service_name, amount, currency)
VALUES
  ('buddys-animal-medical-center', 'Consultation', 350.00, 'HKD'),
  ('buddys-animal-medical-center', 'Vaccination', 280.00, 'HKD'),
  ('petcare-247', 'Emergency consultation', 800.00, 'HKD')
ON CONFLICT (clinic_id, service_name) DO UPDATE SET
  amount = EXCLUDED.amount,
  currency = EXCLUDED.currency,
  updated_at = now();

-- Opening-hours entries use ISO weekday numbers (Mon=1 ... Sun=7).
INSERT INTO clinic_opening_hours (clinic_id, weekday, opens_at, closes_at, is_closed)
VALUES
  ('buddys-animal-medical-center', 1, '09:00', '21:00', FALSE),
  ('buddys-animal-medical-center', 2, '09:00', '21:00', FALSE),
  ('buddys-animal-medical-center', 3, '09:00', '21:00', FALSE),
  ('buddys-animal-medical-center', 4, '09:00', '21:00', FALSE),
  ('buddys-animal-medical-center', 5, '09:00', '21:00', FALSE),
  ('buddys-animal-medical-center', 6, '09:00', '21:00', FALSE),
  ('buddys-animal-medical-center', 7, '09:00', '21:00', FALSE),
  ('central-animal-hospital', 1, '08:00', '22:00', FALSE),
  ('central-animal-hospital', 2, '08:00', '22:00', FALSE),
  ('central-animal-hospital', 3, '08:00', '22:00', FALSE),
  ('central-animal-hospital', 4, '08:00', '22:00', FALSE),
  ('central-animal-hospital', 5, '08:00', '22:00', FALSE),
  ('central-animal-hospital', 6, '08:00', '22:00', FALSE),
  ('central-animal-hospital', 7, '08:00', '22:00', FALSE),
  ('happy-paws-veterinary-clinic', 1, '09:00', '20:00', FALSE),
  ('happy-paws-veterinary-clinic', 2, '09:00', '20:00', FALSE),
  ('happy-paws-veterinary-clinic', 3, '09:00', '20:00', FALSE),
  ('happy-paws-veterinary-clinic', 4, '09:00', '20:00', FALSE),
  ('happy-paws-veterinary-clinic', 5, '09:00', '20:00', FALSE)
ON CONFLICT (clinic_id, weekday) DO UPDATE SET
  opens_at = EXCLUDED.opens_at,
  closes_at = EXCLUDED.closes_at,
  is_closed = EXCLUDED.is_closed;

-- Intentionally do not seed the UI's preview comments as real reviews.
COMMIT;
