const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatLastUpdated(date: Date | null): string {
  if (!date) {
    return 'Last updated: unknown';
  }

  const hour24 = date.getHours();
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 < 12 ? 'AM' : 'PM';
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `Last updated: ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${hour12}:${minute} ${ampm}`;
}
