import { ChevronRight, Clock3, PawPrint, Phone, Star } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Clinic } from '@/types/clinic';

type ClinicBottomSheetProps = {
  clinic: Clinic | null;
  onClose: () => void;
  onOpenDetails: (clinicId: string) => void;
};

export function ClinicBottomSheet({ clinic, onClose, onOpenDetails }: ClinicBottomSheetProps) {
  return (
    <Modal visible={clinic !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Close clinic details" onPress={onClose} style={styles.backdrop} />
        {clinic && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View details for ${clinic.name}`}
            onPress={() => onOpenDetails(clinic.id)}
            style={styles.sheetPressable}>
            <ThemedView style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.header}>
                <View style={styles.clinicIcon}>
                  <PawPrint size={21} color="#147d72" />
                </View>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.eyebrow}>VETERINARY CLINIC</ThemedText>
                  <ThemedText style={styles.title}>{clinic.name}</ThemedText>
                </View>
                <ChevronRight size={21} color="#8a9994" />
              </View>
              <View style={styles.summary}>
                <View style={styles.ratingPill}>
                  <Star size={15} color="#d99a18" fill="#d99a18" />
                  <ThemedText style={styles.ratingText}>
                    {clinic.rating?.toFixed(1) ?? '—'}
                  </ThemedText>
                  <ThemedText style={styles.ratingCaption}>rating</ThemedText>
                </View>
                {clinic.isOpen24Hours && (
                  <View style={styles.openPill}>
                    <View style={styles.openDot} />
                    <ThemedText style={styles.openText}>Open 24 hours</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.details}>
                <DetailRow
                  icon={<Phone size={17} color="#147d72" />}
                  label="Phone"
                  value={clinic.phone ?? 'Not available'}
                />
                <View style={styles.divider} />
                <DetailRow
                  icon={<Clock3 size={17} color="#147d72" />}
                  label="Opening hours"
                  value={clinic.openingHours ?? 'Hours not available'}
                />
              </View>
            </ThemedView>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailCopy}>
        <ThemedText style={styles.detailLabel}>{label}</ThemedText>
        <ThemedText style={styles.detailValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  sheetPressable: { width: '100%', maxWidth: 620, alignSelf: 'center', borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  sheet: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 26, borderTopLeftRadius: 26, borderTopRightRadius: 26, gap: 17, backgroundColor: '#fff', shadowColor: '#173f38', shadowOpacity: 0.16, shadowRadius: 20, shadowOffset: { width: 0, height: -5 }, elevation: 10 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dfda' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clinicIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f4ef' },
  titleBlock: { flex: 1, gap: 3 },
  eyebrow: { color: '#7a9189', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: '#1b3832', fontSize: 18, fontWeight: '800', lineHeight: 23 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff7e5' },
  ratingText: { color: '#4b4030', fontSize: 12, fontWeight: '800' },
  ratingCaption: { color: '#8a7a60', fontSize: 11 },
  openPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e8f6ec' },
  openDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#24a148' },
  openText: { color: '#257548', fontSize: 11, fontWeight: '700' },
  details: { paddingHorizontal: 13, paddingVertical: 3, borderRadius: 18, backgroundColor: '#f6f9f7' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9 },
  detailIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#e7f3ee' },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: { color: '#84928d', fontSize: 10, fontWeight: '700' },
  detailValue: { color: '#263e38', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginLeft: 43, backgroundColor: '#e8eeeb' },
});
