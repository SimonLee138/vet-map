export type Clinic = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
  isOpen24Hours?: boolean;
  acceptsExoticPets: boolean;
  services?: string[];
  fees?: Array<{
    service: string;
    amount: number;
    currency?: string;
  }>;
};
