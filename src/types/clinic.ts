export type Clinic = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  rating?: number;
  openingHours?: string;
  isOpen24Hours?: boolean;
  acceptsExoticPets?: boolean;
};
