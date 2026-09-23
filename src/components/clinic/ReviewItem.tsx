import { ThemedText } from '@/components/themed-text';

export function ReviewItem({ review }: { review: string }) {
  return <ThemedText>{review}</ThemedText>;
}
