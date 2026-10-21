import type { Clinic } from '@/types/clinic';

export type ClinicMapCategory = 'general' | '24-hours' | 'exotic' | '24-hours-exotic';

type ClinicMapAttributes = Pick<Clinic, 'isOpen24Hours' | 'openingHours' | 'acceptsExoticPets'>;

export function getClinicMapCategory(clinic: ClinicMapAttributes): ClinicMapCategory {
  const is24Hours = clinic.isOpen24Hours === true || /24\s*hours/i.test(clinic.openingHours ?? '');
  if (is24Hours && clinic.acceptsExoticPets) return '24-hours-exotic';
  if (is24Hours) return '24-hours';
  if (clinic.acceptsExoticPets) return 'exotic';
  return 'general';
}

export function getClinicMapCategoryColor(category: ClinicMapCategory): string {
  switch (category) {
    case '24-hours':
      return '#7c3aed';
    case 'exotic':
      return '#d97706';
    case '24-hours-exotic':
      return '#176b87';
    case 'general':
      return '#147d72';
  }
}
