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
    let subscription: Location.LocationSubscription | null = null;

    async function watchLocation() {
      await refresh();
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) return;

      subscription = await Location.watchPositionAsync(
        { distanceInterval: 25, timeInterval: 10000 },
        (next) =>
          setState({
            location: {
              latitude: next.coords.latitude,
              longitude: next.coords.longitude,
            },
            error: null,
            permissionStatus: 'granted',
          }),
      );
    }

    void watchLocation();
    return () => subscription?.remove();
  }, [refresh]);

  return { location, error, permissionStatus, refresh };
}
