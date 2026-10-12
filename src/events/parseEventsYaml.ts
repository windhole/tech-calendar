// vite.config.ts（ビルド時の events.ics 生成）からも読むので、@/ ではなく相対パスで import する
import { load } from 'js-yaml';
import type { Event } from '../types';
import { parseEventRegion } from './regions';

function toIsoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseEventsYaml(text: string, sourceName: string): Event[] {
  const parsed = load(text);

  if (!Array.isArray(parsed)) {
    console.error(`${sourceName} はリストである必要があります`);
    return [];
  }

  const events: Event[] = [];

  for (const item of parsed) {
    if (!isRecord(item)) {
      continue;
    }

    const startDate = toIsoDate(item.startDate);
    const endDate = toIsoDate(item.endDate);
    if (
      !startDate ||
      !endDate ||
      typeof item.eventName !== 'string' ||
      typeof item.location !== 'string' ||
      typeof item.url !== 'string'
    ) {
      continue;
    }

    events.push({
      startDate,
      endDate,
      eventName: item.eventName,
      location: item.location,
      url: item.url,
      region: parseEventRegion(item),
    });
  }

  return events;
}
