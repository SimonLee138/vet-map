import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  PawPrint,
  Phone,
  Star,
} from 'lucide-react-native';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageCanvasColor } from '@/constants/theme';
import { clinicReviews } from '@/data/clinic-reviews';
import { clinics } from '@/data/clinics';

export default function ClinicDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clinic = clinics.find((item) => item.id === id);

  if (!clinic) {
    return (
      <ThemedView style={styles.notFound}>
        <View style={styles.notFoundIcon}><MapPin size={24} color="#147d72" /></View>
        <ThemedText style={styles.notFoundTitle}>Clinic not found</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
          <ThemedText style={styles.secondaryButtonText}>Go back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Back to map">
            <ArrowLeft size={20} color="#183b36" />
          </Pressable>
          <ThemedText style={styles.topBarTitle}>Clinic profile</ThemedText>
          <View style={styles.topBarSpacer} />
        </View>

        <ThemedView style={styles.hero}>
          <View style={styles.heroTopLine}>
            <View style={styles.heroIcon}><PawPrint size={21} color="#fff" /></View>
            <View style={styles.categoryPill}>
              <ThemedText style={styles.categoryText}>VETERINARY CLINIC</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.title}>{clinic.name}</ThemedText>
          <View style={styles.heroBottomLine}>
            <View style={styles.rating}>
              <Star size={16} color="#f3c969" fill="#f3c969" />
              <ThemedText style={styles.ratingText}>
                {clinic.rating !== undefined ? `${clinic.rating.toFixed(1)} rating` : 'Not rated'}
              </ThemedText>
            </View>
            {clinic.isOpen24Hours && (
              <View style={styles.openPill}>
                <View style={styles.openDot} />
                <ThemedText style={styles.openText}>Open 24 hours</ThemedText>
              </View>
            )}
          </View>
        </ThemedView>

        <View style={styles.reviewActions}>
          <Pressable
            onPress={() => router.push({ pathname: '/clinic/[id]/reviews', params: { id: clinic.id } })}
            style={({ pressed }) => [styles.reviewAction, pressed && styles.pressed]}>
            <MessageCircle size={17} color="#147d72" />
            <ThemedText style={styles.reviewActionText}>
              Read comments ({clinicReviews.filter((review) => review.clinicId === clinic.id).length})
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: '/clinic/[id]/review', params: { id: clinic.id } })}
            style={({ pressed }) => [styles.rateAction, pressed && styles.pressed]}>
            <Star size={17} color="#fff" />
            <ThemedText style={styles.rateActionText}>Rate clinic</ThemedText>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="link"
            disabled={!clinic.phone}
            onPress={() => clinic.phone && void Linking.openURL(`tel:${clinic.phone}`)}
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed, !clinic.phone && styles.disabledAction]}>
            <Phone size={18} color="#fff" />
            <ThemedText style={styles.primaryActionText}>Call clinic</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`)}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
            <Navigation size={18} color="#147d72" />
            <ThemedText style={styles.secondaryActionText}>Directions</ThemedText>
          </Pressable>
        </View>

        <InfoSection title="Visit information" subtitle="Everything you need before you go">
          <InfoRow icon={<MapPin size={19} color="#147d72" />} label="Location">
            <ThemedText style={styles.infoValue}>{clinic.address ?? 'Address not available'}</ThemedText>
            <ThemedText style={styles.coordinates}>
              {clinic.latitude.toFixed(5)}, {clinic.longitude.toFixed(5)}
            </ThemedText>
          </InfoRow>
          <View style={styles.divider} />
          <InfoRow icon={<Phone size={19} color="#147d72" />} label="Phone">
            <ThemedText style={[styles.infoValue, clinic.phone && styles.phone]}>
              {clinic.phone ?? 'Phone number not available'}
            </ThemedText>
          </InfoRow>
          <View style={styles.divider} />
          <InfoRow icon={<Clock3 size={19} color="#147d72" />} label="Opening hours">
            <ThemedText style={styles.infoValue}>
              {clinic.openingHours ?? 'Opening hours not available'}
            </ThemedText>
          </InfoRow>
        </InfoSection>

        {clinic.services && clinic.services.length > 0 && (
          <InfoSection title="Services & care" subtitle="Care available at this clinic">
            <View style={styles.chips}>
              {clinic.services.map((service) => (
                <View key={service} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{service}</ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.exoticInfo}>
              <BadgeCheck size={18} color={clinic.acceptsExoticPets ? '#147d72' : '#83918d'} />
              <ThemedText style={styles.exoticText}>
                {clinic.acceptsExoticPets ? 'Exotic animal care available' : 'Exotic animal care not available'}
              </ThemedText>
            </View>
          </InfoSection>
        )}

        {clinic.fees && clinic.fees.length > 0 && (
          <InfoSection title="Typical fees" subtitle="Confirm final pricing with the clinic">
            <View style={styles.fees}>
              {clinic.fees.map((fee) => (
                <View key={fee.service} style={styles.feeRow}>
                  <ThemedText style={styles.feeService}>{fee.service}</ThemedText>
                  <ThemedText style={styles.feeAmount}>{fee.currency ?? 'HK$'} {fee.amount.toFixed(2)}</ThemedText>
                </View>
              ))}
            </View>
          </InfoSection>
        )}
      </View>
    </ScrollView>
  );
}

function InfoSection({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <ThemedView style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        {subtitle && <ThemedText style={styles.sectionSubtitle}>{subtitle}</ThemedText>}
      </View>
      {children}
    </ThemedView>
  );
}

function InfoRow({
  children,
  icon,
  label,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <ThemedText style={styles.infoLabel}>{label}</ThemedText>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: PageCanvasColor },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36, backgroundColor: PageCanvasColor },
  container: { width: '100%', maxWidth: 720, gap: 16, paddingBottom: 24, backgroundColor: 'transparent' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: PageCanvasColor },
  notFoundIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2f1ec' },
  notFoundTitle: { fontSize: 23, fontWeight: '800', color: '#183b36' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 42 },
  backButton: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5ece8' },
  topBarTitle: { color: '#59706a', fontSize: 14, fontWeight: '700' },
  topBarSpacer: { width: 40 },
  secondaryButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, backgroundColor: '#e2f1ec' },
  secondaryButtonText: { color: '#147d72', fontWeight: '700' },
  hero: { gap: 18, padding: 22, borderRadius: 24, backgroundColor: '#173f38' },
  heroTopLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)' },
  categoryText: { color: '#d5e8df', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 29, lineHeight: 35, fontWeight: '800' },
  heroBottomLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ratingText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  openPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(194,244,213,0.15)' },
  openDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#70e19a' },
  openText: { color: '#c8f5d8', fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  reviewActions: { flexDirection: 'row', gap: 9 },
  reviewAction: { flex: 1.15, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 8, borderRadius: 15, backgroundColor: '#e8f4ef', borderWidth: 1, borderColor: '#d8ebe3' },
  reviewActionText: { color: '#147d72', fontSize: 14, fontWeight: '800' },
  rateAction: { flex: 0.85, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 8, borderRadius: 15, backgroundColor: '#147d72' },
  rateActionText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  primaryAction: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 16, backgroundColor: '#147d72' },
  primaryActionText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  secondaryAction: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce8e3' },
  secondaryActionText: { color: '#147d72', fontSize: 14, fontWeight: '800' },
  disabledAction: { opacity: 0.5 },
  pressed: { opacity: 0.78 },
  section: { gap: 15, padding: 18, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8eeeb' },
  sectionHeader: { gap: 3 },
  sectionTitle: { color: '#1c3934', fontSize: 17, lineHeight: 22, fontWeight: '800' },
  sectionSubtitle: { color: '#83918d', fontSize: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eaf5f0' },
  infoContent: { flex: 1, gap: 3, paddingTop: 1 },
  infoLabel: { color: '#84928e', fontSize: 11, fontWeight: '700' },
  infoValue: { color: '#203b36', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  coordinates: { color: '#92a09b', fontSize: 11 },
  divider: { height: 1, marginLeft: 48, backgroundColor: '#edf1ef' },
  phone: { color: '#147d72', fontSize: 14, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 13, backgroundColor: '#eef6f2', borderWidth: 1, borderColor: '#e0eee7' },
  chipText: { color: '#27675a', fontSize: 12, fontWeight: '700' },
  exoticInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  exoticText: { color: '#536a63', fontSize: 12, fontWeight: '600' },
  fees: { gap: 0 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#edf1ef' },
  feeService: { color: '#435b54', fontSize: 13 },
  feeAmount: { color: '#1c3934', fontSize: 14, fontWeight: '800' },
});
