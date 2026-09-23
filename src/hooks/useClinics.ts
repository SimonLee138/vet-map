import { useState } from 'react';

import type { Clinic } from '@/types/clinic';

export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  return { clinics, setClinics, isLoading: false };
}
