import { StyleSheet, Text } from 'react-native';

export function Badge({ label }: { label: string }) {
  return <Text style={styles.badge}>{label}</Text>;
}

const styles = StyleSheet.create({ badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#d8eff2', color: '#155e63', overflow: 'hidden' } });
