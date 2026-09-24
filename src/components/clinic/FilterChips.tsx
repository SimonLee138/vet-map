import { Badge } from '@/components/common/Badge';
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
            <Badge label={isSelected ? `✓ ${filter}` : filter} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0, height: 32 },
  row: { gap: 8, alignItems: 'center' },
  chip: { borderRadius: 6 },
  selectedChip: { backgroundColor: '#b8e2e0' },
  pressed: { opacity: 0.7 },
});
