import { useState } from 'react';

import type { Pet } from '@/types/pet';

export function usePetStore() {
  const [pets, setPets] = useState<Pet[]>([]);
  return { pets, setPets };
}
