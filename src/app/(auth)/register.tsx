import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RegisterScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Create account</ThemedText>
    </ThemedView>
  );
}
