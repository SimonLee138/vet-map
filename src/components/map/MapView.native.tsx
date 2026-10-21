import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { MappedClinic } from '@/data/clinics';
import type { Coordinates, PermissionStatus } from '@/hooks/useLocation';
import type { Clinic } from '@/types/clinic';
import { getClinicMapCategory, getClinicMapCategoryColor } from '@/utils/clinic-map-category';

export function MapView({
  location,
  permissionStatus,
  clinics,
  selectedClinicId: _selectedClinicId,
  onClinicSelect,
}: {
  location: Coordinates | null;
  permissionStatus: PermissionStatus;
  clinics: MappedClinic[];
  selectedClinicId?: string;
  onRelocate?: () => void;
  onClinicSelect?: (clinic: Clinic) => void;
}) {
  return (
    <ThemedView style={styles.map}>
      <ThemedText type="subtitle">Map preview</ThemedText>
      {clinics.map((clinic) => (
        <Pressable key={clinic.id} onPress={() => onClinicSelect?.(clinic)} style={styles.clinicRow}>
          <View style={[styles.markerDot, { backgroundColor: getClinicMapCategoryColor(getClinicMapCategory(clinic)) }]} />
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
  clinicRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  markerDot: { width: 10, height: 10, borderRadius: 5 },
});
