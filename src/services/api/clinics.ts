import type { MappedClinic } from '@/data/clinics';
import { supabase } from '@/services/supabase';

type ClinicRow = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  is_open_24_hours: boolean;
  accepts_exotic_pets: boolean;
};

type ServiceRow = { clinic_id: string; name: string };
type FeeRow = { clinic_id: string; service_name: string; amount: number; currency: string };
type HoursRow = {
  clinic_id: string;
  weekday: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
};
type RatingRow = { clinic_id: string; average_rating: number | null; review_count: number };

const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export async function searchClinics(): Promise<MappedClinic[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data: clinicData, error: clinicError } = await supabase
    .from('clinics')
    .select('id, name, address, phone, latitude, longitude, is_open_24_hours, accepts_exotic_pets')
    .eq('is_active', true)
    .order('name');

  if (clinicError) throw new Error(`Could not load clinics: ${clinicError.message}`);
  const clinicRows = (clinicData ?? []) as ClinicRow[];
  if (!clinicRows.length) return [];

  const clinicIds = clinicRows.map((clinic) => clinic.id);
  const [servicesResult, feesResult, hoursResult, ratingsResult] = await Promise.all([
    supabase.from('clinic_services').select('clinic_id, name').in('clinic_id', clinicIds),
    supabase.from('clinic_fees').select('clinic_id, service_name, amount, currency').in('clinic_id', clinicIds),
    supabase.from('clinic_opening_hours').select('clinic_id, weekday, opens_at, closes_at, is_closed').in('clinic_id', clinicIds),
    supabase.from('clinic_rating_summary').select('clinic_id, average_rating, review_count').in('clinic_id', clinicIds),
  ]);

  const relatedError = servicesResult.error ?? feesResult.error ?? hoursResult.error ?? ratingsResult.error;
  if (relatedError) throw new Error(`Could not load clinic details: ${relatedError.message}`);

  const services = (servicesResult.data ?? []) as ServiceRow[];
  const fees = (feesResult.data ?? []) as FeeRow[];
  const hours = (hoursResult.data ?? []) as HoursRow[];
  const ratings = (ratingsResult.data ?? []) as RatingRow[];

  return clinicRows.map((clinic) => {
    const clinicHours = hours.filter((row) => row.clinic_id === clinic.id && !row.is_closed);
    const sameSchedule = clinicHours.length > 0 && clinicHours.every(
      (row) => row.opens_at === clinicHours[0].opens_at && row.closes_at === clinicHours[0].closes_at,
    );
    const weekdays = clinicHours.map((row) => row.weekday).sort((a, b) => a - b);
    const dayLabel = weekdays.length === 7
      ? 'Open daily'
      : weekdays.length === 5 && weekdays[0] === 1 && weekdays[4] === 5
        ? 'Open weekdays'
        : `Open ${weekdays.map((day) => weekdayNames[day - 1]).join(', ')}`;
    const hourLabel = clinic.is_open_24_hours
      ? 'Open 24 hours'
      : sameSchedule
        ? `${dayLabel}, ${formatTime(clinicHours[0].opens_at)} - ${formatTime(clinicHours[0].closes_at)}`
        : 'Hours vary by day';
    const rating = ratings.find((row) => row.clinic_id === clinic.id);

    return {
      id: clinic.id,
      name: clinic.name,
      address: clinic.address ?? undefined,
      phone: clinic.phone ?? undefined,
      latitude: Number(clinic.latitude),
      longitude: Number(clinic.longitude),
      isOpen24Hours: clinic.is_open_24_hours,
      acceptsExoticPets: clinic.accepts_exotic_pets,
      openingHours: hourLabel,
      rating: rating?.average_rating ?? undefined,
      services: services.filter((row) => row.clinic_id === clinic.id).map((row) => row.name),
      fees: fees
        .filter((row) => row.clinic_id === clinic.id)
        .map((row) => ({ service: row.service_name, amount: Number(row.amount), currency: row.currency.trim() === 'HKD' ? 'HK$' : row.currency.trim() })),
    };
  });
}

function formatTime(value: string) {
  const [hourString, minute] = value.split(':');
  const hour = Number(hourString);
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${period}`;
}
