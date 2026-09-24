import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { MappedClinic } from '@/data/clinics';
import type { Coordinates, PermissionStatus } from '@/hooks/useLocation';
import type { Clinic } from '@/types/clinic';

export function MapView({
  location,
  permissionStatus,
  clinics,
  onClinicSelect,
}: {
  location: Coordinates | null;
  permissionStatus: PermissionStatus;
  clinics: MappedClinic[];
  onClinicSelect?: (clinic: Clinic) => void;
}) {
  const permissionLabel =
    permissionStatus === 'granted'
      ? 'Location permission enabled'
      : permissionStatus === 'denied'
        ? 'Location permission disabled - showing default map area'
        : 'Checking location permission...';

  return (
    <ThemedView style={styles.map}>
      <ThemedText type="smallBold">{permissionLabel}</ThemedText>
      <ThemedText type="subtitle">Map preview</ThemedText>
      {clinics.map((clinic) => (
        <Pressable key={clinic.id} onPress={() => onClinicSelect?.(clinic)}>
          <ThemedText type="smallBold">{clinic.name}</ThemedText>
        </Pressable>
      ))}
      <ThemedText themeColor="textSecondary">
        {location
          ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
          : 'Showing the default map area until location is available.'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 360, justifyContent: 'center', alignItems: 'center', gap: 8 },
});
