import { Badge } from '@/components/common/Badge';

export function FilterChips({ filters }: { filters: string[] }) {
  return filters.map((filter) => <Badge key={filter} label={filter} />);
}
