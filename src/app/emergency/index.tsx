import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function EmergencyScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Emergency help</ThemedText>
      <ThemedText themeColor="textSecondary">Find urgent veterinary care.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
});
