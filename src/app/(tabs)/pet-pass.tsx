import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PetPassScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Pet Pass</ThemedText>
      <ThemedText themeColor="textSecondary">Keep your pet health records in one place.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
});
