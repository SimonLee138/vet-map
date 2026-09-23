import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({ card: { padding: 16, borderRadius: 8, backgroundColor: '#f0f0f3' } });
