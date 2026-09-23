import { Card } from '@/components/common/Card';
import { ThemedText } from '@/components/themed-text';

export function QRCodeCard({ petName }: { petName: string }) {
  return <Card><ThemedText>Pet Pass for {petName}</ThemedText></Card>;
}
