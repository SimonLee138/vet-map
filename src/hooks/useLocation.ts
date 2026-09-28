import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type Coordinates = { latitude: number; longitude: number };
export type PermissionStatus = 'checking' | 'granted' | 'denied';

type LocationState = {
  location: Coordinates | null;
  error: string | null;
  permissionStatus: PermissionStatus;
};

export function useLocation() {
  const [{ location, error, permissionStatus }, setState] = useState<LocationState>({
    location: null,
    error: null,
    permissionStatus: 'checking',
  });

  const refresh = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setState({
          location: null,
          error: 'Location permission was denied.',
          permissionStatus: 'denied',
        });
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setState({
        location: {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        },
        error: null,
        permissionStatus: 'granted',
      });
    } catch {
      setState({
        location: null,
        error: 'Unable to determine your location.',
        permissionStatus: 'denied',
      });
    }
  }, []);

  useEffect(() => {
    async function checkPermission() {
      const permission = await Location.getForegroundPermissionsAsync();
      setState((current) => ({
        ...current,
        permissionStatus: permission.granted ? 'granted' : 'denied',
      }));
    }

    void checkPermission();
  }, []);

  return { location, error, permissionStatus, refresh };
}
