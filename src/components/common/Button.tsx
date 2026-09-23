import { Pressable, StyleSheet, Text } from 'react-native';

type ButtonProps = { label: string; onPress?: () => void };

export function Button({ label, onPress }: ButtonProps) {
  return <Pressable onPress={onPress} style={styles.button}><Text style={styles.label}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { padding: 14, borderRadius: 8, backgroundColor: '#176b87' }, label: { color: '#fff', fontWeight: '600' } });
