import { useEffect, useState } from 'react';

import { searchClinics } from '@/services/api/clinics';
import type { Clinic } from '@/types/clinic';

export function useClinic(id: string | undefined) {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setClinic(null);
      setIsLoading(false);
      setError('Clinic id is missing.');
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    setError(null);
    searchClinics()
      .then((clinics) => {
        if (!cancelled) {
          setClinic(clinics.find((item) => item.id === id) ?? null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setClinic(null);
          setError(cause instanceof Error ? cause.message : 'Could not load clinic.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { clinic, isLoading, error };
}
