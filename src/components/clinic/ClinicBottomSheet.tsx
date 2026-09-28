import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Clinic } from '@/types/clinic';

type ClinicBottomSheetProps = {
  clinic: Clinic | null;
  onClose: () => void;
};

export function ClinicBottomSheet({ clinic, onClose }: ClinicBottomSheetProps) {
  return (
    <Modal visible={clinic !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Close clinic details" onPress={onClose} style={styles.backdrop} />
        {clinic && (
          <ThemedView style={styles.sheet}>
            <View style={styles.handle} />
            <View>
              <View style={styles.titleBlock}>
                <ThemedText type="subtitle" style={styles.title}>{clinic.name}</ThemedText>
              </View>
            </View>
            <View>
              <DetailRow label="Rating" value={`${clinic.rating?.toFixed(1) ?? 'Not available'} / 5`} />
              <DetailRow label="Phone" value={clinic.phone ?? 'Not available'} />
              <DetailRow label="Opening hours" value={clinic.openingHours ?? 'Hours not available'} />
              <DetailRow label="Exotic animals" value={clinic.acceptsExoticPets ? 'Yes' : 'No'} />
            </View>
          </ThemedView>
        )}
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 10, borderTopLeftRadius: 22, borderTopRightRadius: 22, gap: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#aeb7c2' },
  titleBlock: { flex: 1, gap: 4 },
  title: { fontSize: 18, fontWeight: 'bold', lineHeight: 22 },
  // details: { gap: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  detailValue: { flex: 1, textAlign: 'right' },
});
