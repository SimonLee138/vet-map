export function formatPrice(amount: number, currency = '$') {
  return `${currency}${amount.toFixed(2)}`;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}
