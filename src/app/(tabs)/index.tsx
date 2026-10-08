import { router } from 'expo-router';
import { MapPin, Search, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ClinicBottomSheet } from '@/components/clinic/ClinicBottomSheet';
import { FilterChips } from '@/components/clinic/FilterChips';
import { MapView } from '@/components/map/MapView';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageCanvasColor } from '@/constants/theme';
import type { MappedClinic } from '@/data/clinics';
import { useLocation } from '@/hooks/useLocation';
import { searchClinics } from '@/services/api/clinics';
import type { Clinic } from '@/types/clinic';

export default function SearchScreen() {
  const { location, error, permissionStatus } = useLocation();
  const [clinics, setClinics] = useState<MappedClinic[]>([]);
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [clinicsError, setClinicsError] = useState<string | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const filterOptions = ['24 hours', 'Open now', 'Exotic animals'];
  const loadClinics = useCallback(async () => {
    setClinicsLoading(true);
    setClinicsError(null);
    try {
      setClinics(await searchClinics());
    } catch (cause) {
      setClinicsError(cause instanceof Error ? cause.message : 'Could not load clinics.');
    } finally {
      setClinicsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClinics();
  }, [loadClinics]);

  const filteredSuggestions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const clinicsMatchingFilters = selectedFilters.length === 0
      ? clinics
      : clinics.filter((clinic) => selectedFilters.every((filter) => {
          if (filter === '24 hours') return clinic.isOpen24Hours === true;
          if (filter === 'Open now') {
            return clinic.isOpen24Hours === true || clinic.openingHours?.includes('Open') === true;
          }
          if (filter === 'Exotic animals') return clinic.acceptsExoticPets;
          return true;
        }));

    if (!query) return clinicsMatchingFilters;
    return clinicsMatchingFilters.filter((clinic) =>
      `${clinic.name} ${clinic.address ?? ''}`.toLowerCase().includes(query),
    );
  }, [clinics, searchText, selectedFilters]);

  return (
    <ThemedView style={styles.container}>
      {isDropdownOpen && (
        <Pressable
          accessibilityLabel="Close search suggestions"
          onPress={() => setIsDropdownOpen(false)}
          style={styles.dismissLayer}
        />
      )}
      <View style={styles.pageHeader}>
        <ThemedText style={styles.eyebrow}>VETERINARY CARE · HONG KONG</ThemedText>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <ThemedText style={styles.pageTitle}>Find a clinic</ThemedText>
            <ThemedText style={styles.subtitle}>Trusted care for every kind of pet.</ThemedText>
          </View>
          <View style={styles.resultBadge}>
            <MapPin size={15} color="#147d72" />
            <ThemedText style={styles.resultBadgeText}>{filteredSuggestions.length}</ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Search size={19} color="#77858b" style={styles.searchIcon} />
          <TextInput
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Clinic name or neighbourhood"
            placeholderTextColor="#7b8490"
            style={styles.searchInput}
            accessibilityLabel="Search veterinary clinics"
          />
          {searchText.length > 0 && (
            <Pressable
              accessibilityLabel="Clear clinic search"
              onPress={() => {
                setSearchText('');
                setIsDropdownOpen(true);
              }}
              hitSlop={8}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
              <X size={18} color="#718096" strokeWidth={2.5} />
            </Pressable>
          )}
        </View>
        {isDropdownOpen && (
          <View style={styles.dropdown}>
            {clinicsLoading ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyResult}>Loading clinics…</ThemedText>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((clinic) => (
                <Pressable
                  key={clinic.id}
                  onPress={() => {
                    setSearchText(clinic.name);
                    setIsDropdownOpen(false);
                    setSelectedClinic(clinic);
                  }}
                  style={({ pressed }) => [styles.dropdownItem, pressed && styles.pressed]}>
                  <ThemedText>{clinic.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {clinic.address}
                  </ThemedText>
                </Pressable>
              ))
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.emptyResult}>
                {clinicsError ? 'Clinics could not be loaded' : 'No clinics found'}
              </ThemedText>
            )}
          </View>
        )}
      </View>
      <FilterChips
        filters={filterOptions}
        selectedFilters={selectedFilters}
        onToggle={(filter) =>
          setSelectedFilters((current) =>
            current.includes(filter)
              ? current.filter((selected) => selected !== filter)
              : [...current, filter],
          )
        }
      />
      <View style={styles.mapSectionHeader}>
        <View>
          <ThemedText style={styles.sectionEyebrow}>CLINICS ON MAP</ThemedText>
          <ThemedText style={styles.matchText}>
            {clinicsLoading
              ? 'Loading clinics…'
              : `${filteredSuggestions.length} ${filteredSuggestions.length === 1 ? 'clinic' : 'clinics'} match your search`}
          </ThemedText>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.openDot]} />
            <ThemedText style={styles.legendText}>Open</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.closedDot]} />
            <ThemedText style={styles.legendText}>Closed</ThemedText>
          </View>
        </View>
      </View>
      <ThemedView style={styles.mapContainer}>
        <MapView
          location={location}
          permissionStatus={permissionStatus}
          clinics={filteredSuggestions}
          selectedClinicId={selectedClinic?.id}
          onClinicSelect={setSelectedClinic}
        />
      </ThemedView>
      {clinicsError && (
        <View style={styles.databaseError}>
          <ThemedText style={styles.databaseErrorText}>{clinicsError}</ThemedText>
          <Pressable onPress={() => void loadClinics()} accessibilityRole="button">
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </Pressable>
        </View>
      )}
      {error && <ThemedText themeColor="textSecondary">{error}</ThemedText>}
      <ClinicBottomSheet
        clinic={selectedClinic}
        onClose={() => setSelectedClinic(null)}
        onOpenDetails={(clinicId) => {
          setSelectedClinic(null);
          router.push({ pathname: '/clinic/[id]', params: { id: clinicId } });
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 14, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 12, position: 'relative', backgroundColor: PageCanvasColor },
  dismissLayer: { ...StyleSheet.absoluteFill, zIndex: 1 },
  pageHeader: { gap: 5 },
  eyebrow: { color: '#147d72', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titleCopy: { flex: 1, gap: 2 },
  pageTitle: { color: '#142c2a', fontSize: 30, lineHeight: 36, fontWeight: '800' },
  subtitle: { color: '#71817e', fontSize: 14 },
  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e4f3ef' },
  resultBadgeText: { color: '#147d72', fontSize: 13, fontWeight: '800' },
  searchSection: { position: 'relative', zIndex: 2 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2eae7',
    borderRadius: 14,
    backgroundColor: '#fff',
    minHeight: 52,
    shadowColor: '#123b35',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchIcon: { marginLeft: 15 },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 11,
    color: '#17312e',
    fontSize: 15,
  },
  clearButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#e2eae7',
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 13 },
  emptyResult: { paddingHorizontal: 16, paddingVertical: 13 },
  databaseError: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 12, borderRadius: 12, backgroundColor: '#fff1ef' },
  databaseErrorText: { flex: 1, color: '#9d342a', fontSize: 12 },
  retryText: { color: '#147d72', fontSize: 13, fontWeight: '800' },
  pressed: { backgroundColor: '#eef5f7' },
  mapSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 1 },
  sectionEyebrow: { color: '#6d807b', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  matchText: { color: '#294541', fontSize: 13, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  openDot: { backgroundColor: '#24a148' },
  closedDot: { backgroundColor: '#d94b4b' },
  legendText: { color: '#788985', fontSize: 11 },
  mapContainer: { flex: 1, minHeight: 280, overflow: 'hidden', borderRadius: 20, borderWidth: 1, borderColor: '#e3ebe8', backgroundColor: '#eaf1ee', shadowColor: '#163f38', shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
});
