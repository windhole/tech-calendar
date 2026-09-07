import { EVENT_REGIONS, type Event, type EventRegion } from '@/types';

const REGION_SET = new Set<string>(EVENT_REGIONS);

export function isEventRegion(value: string): value is EventRegion {
  return REGION_SET.has(value);
}

export function normalizeRegionValue(raw: string): string {
  return raw.trim().replace(/^#/, '').trim();
}

function regionFromUnknown(value: unknown): EventRegion | null {
  if (typeof value === 'string') {
    const normalized = normalizeRegionValue(value);
    return isEventRegion(normalized) ? normalized : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item !== 'string') {
        continue;
      }
      const normalized = normalizeRegionValue(item);
      if (isEventRegion(normalized)) {
        return normalized;
      }
    }
  }

  return null;
}

export function parseEventRegion(item: Record<string, unknown>): EventRegion | null {
  return (
    regionFromUnknown(item.region) ??
    regionFromUnknown(item.tag) ??
    regionFromUnknown(item.tags)
  );
}

export function regionsInEvents(events: Event[]): EventRegion[] {
  const seen = new Set<EventRegion>();

  for (const event of events) {
    if (event.region) {
      seen.add(event.region);
    }
  }

  return EVENT_REGIONS.filter((region) => seen.has(region));
}

export function eventMatchesRegions(
  event: Event,
  selected: EventRegion[]
): boolean {
  if (selected.length === 0) {
    return true;
  }

  return event.region !== null && selected.includes(event.region);
}

export function filterEventsByRegions(
  events: Event[],
  selected: EventRegion[]
): Event[] {
  if (selected.length === 0) {
    return events;
  }

  return events.filter((event) => eventMatchesRegions(event, selected));
}
