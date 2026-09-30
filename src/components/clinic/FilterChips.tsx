import { ThemedText } from '@/components/themed-text';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

type FilterChipsProps = {
  filters: string[];
  selectedFilters: string[];
  onToggle: (filter: string) => void;
};

export function FilterChips({ filters, selectedFilters, onToggle }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {filters.map((filter) => {
        const isSelected = selectedFilters.includes(filter);
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onToggle(filter)}
            style={({ pressed }) => [styles.chip, isSelected && styles.selectedChip, pressed && styles.pressed]}>
            {isSelected && <Check size={14} color="#fff" strokeWidth={2.5} />}
            <ThemedText style={[styles.label, isSelected && styles.selectedLabel]}>{filter}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0, height: 38 },
  row: { gap: 8, alignItems: 'center', paddingRight: 4 },
  chip: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, borderRadius: 18, borderWidth: 1, borderColor: '#dce6e2', backgroundColor: '#fff' },
  selectedChip: { borderColor: '#147d72', backgroundColor: '#147d72' },
  label: { color: '#53645f', fontSize: 12, fontWeight: '600' },
  selectedLabel: { color: '#fff' },
  pressed: { opacity: 0.7 },
});
