import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ClinicBottomSheet } from '@/components/clinic/ClinicBottomSheet';
import { FilterChips } from '@/components/clinic/FilterChips';
import { MapView } from '@/components/map/MapView';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { clinics } from '@/data/clinics';
import { useLocation } from '@/hooks/useLocation';
import type { Clinic } from '@/types/clinic';

export default function SearchScreen() {
  const { location, error, permissionStatus } = useLocation();
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const filterOptions = ['24 hours', 'Open now', 'Exotic animals'];
  const filteredSuggestions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return clinics.filter((clinic) => {
      const matchesSearch =
        !query || `${clinic.name} ${clinic.address ?? ''}`.toLowerCase().includes(query);
      const matchesFilters =
        (!selectedFilters.includes('24 hours') || clinic.isOpen24Hours) &&
        (!selectedFilters.includes('Open now') || clinic.isOpen24Hours || clinic.openingHours?.includes('Open')) &&
        (!selectedFilters.includes('Exotic animals') || clinic.acceptsExoticPets);
      return matchesSearch && matchesFilters;
    });
  }, [searchText, selectedFilters]);

  return (
    <ThemedView style={styles.container}>
      {isDropdownOpen && (
        <Pressable
          accessibilityLabel="Close search suggestions"
          onPress={() => setIsDropdownOpen(false)}
          style={styles.dismissLayer}
        />
      )}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <TextInput
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search clinics or areas"
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
            {filteredSuggestions.length > 0 ? (
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
                No clinics found
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
      <ThemedView style={styles.mapContainer}>
        <MapView
          location={location}
          permissionStatus={permissionStatus}
          clinics={filteredSuggestions}
          selectedClinicId={selectedClinic?.id}
          onClinicSelect={setSelectedClinic}
        />
      </ThemedView>
      {error && <ThemedText themeColor="textSecondary">{error}</ThemedText>}
      <ClinicBottomSheet clinic={selectedClinic} onClose={() => setSelectedClinic(null)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, padding: 24, position: 'relative' },
  dismissLayer: { ...StyleSheet.absoluteFill, zIndex: 1 },
  searchSection: { position: 'relative', zIndex: 2 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c8ced6',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    color: '#17202a',
    fontSize: 16,
  },
  clearButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#c8ced6',
    borderRadius: 10,
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
  pressed: { backgroundColor: '#eef5f7' },
  mapContainer: { flex: 1, overflow: 'hidden', borderRadius: 12 },
});
