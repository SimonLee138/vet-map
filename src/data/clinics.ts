import type { Clinic } from '@/types/clinic';

export type MappedClinic = Clinic & {
  latitude: number;
  longitude: number;
};

export const clinics: MappedClinic[] = [
  {
    id: 'buddys-animal-medical-center',
    name: "Buddy's Animal Medical Center",
    address: 'Kowloon, Hong Kong',
    latitude: 22.339347563319834,
    longitude: 114.15269326513197,
    rating: 4.8,
    phone: '+852 2345 6789',
    openingHours: 'Open daily, 9:00 AM - 9:00 PM',
    isOpen24Hours: false,
  },
  {
    id: 'central-animal-hospital',
    name: 'Central Animal Hospital',
    address: 'Central, Hong Kong',
    latitude: 22.2819,
    longitude: 114.1582,
    rating: 4.6,
    phone: '+852 2123 4567',
    openingHours: 'Open daily, 8:00 AM - 10:00 PM',
    isOpen24Hours: false,
  },
  {
    id: 'petcare-247',
    name: 'PetCare 24/7',
    address: 'Mong Kok, Hong Kong',
    latitude: 22.3193,
    longitude: 114.1694,
    rating: 4.5,
    phone: '+852 2987 6543',
    openingHours: 'Open 24 hours',
    isOpen24Hours: true,
  },
  {
    id: 'happy-paws-veterinary-clinic',
    name: 'Happy Paws Veterinary Clinic',
    address: 'Sha Tin, Hong Kong',
    latitude: 22.3771,
    longitude: 114.1953,
    rating: 4.7,
    phone: '+852 2678 9012',
    openingHours: 'Open weekdays, 9:00 AM - 8:00 PM',
    isOpen24Hours: false,
  },
];
