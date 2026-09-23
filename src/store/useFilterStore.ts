import { useState } from 'react';

export function useFilterStore() {
  const [filters, setFilters] = useState<string[]>([]);
  return { filters, setFilters };
}
