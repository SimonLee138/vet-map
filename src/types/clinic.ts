export type Clinic = {
  id: string;
  name: string;
  nameZh?: string;
  district?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  operatingHoursInfo?: string;
  latitude?: number | null;
  longitude?: number | null;
  isOpen24Hours?: boolean;
  acceptsExoticPets: boolean;
  specialization?: string;
  services?: string[];
  fees?: Array<{
    service: string;
    amount: number;
    currency?: string;
  }>;
};
