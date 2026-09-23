import { Card } from '@/components/common/Card';
import { ThemedText } from '@/components/themed-text';

export function ClinicCard({ name }: { name: string }) {
  return <Card><ThemedText type="subtitle">{name}</ThemedText></Card>;
}
