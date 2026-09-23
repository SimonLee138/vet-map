import { useEffect, useState } from 'react';

type Coordinates = { latitude: number; longitude: number };

export function useLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    return () => setLocation(null);
  }, []);

  return { location, setLocation };
}
