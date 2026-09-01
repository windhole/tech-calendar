import type { Event } from '@/types';

export function eventOverlapsRange(
  event: Event,
  rangeStart: string,
  rangeEnd: string
): boolean {
  return event.startDate <= rangeEnd && event.endDate >= rangeStart;
}

export function isUpcomingEvent(event: Event, today: string): boolean {
  return event.endDate >= today;
}
