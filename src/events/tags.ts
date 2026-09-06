import type { Event } from '@/types';

export function normalizeTags(values: string[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const value of values) {
    const tag = value.trim();
    if (!tag || seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    tags.push(tag);
  }

  return tags;
}

export function splitCsvTags(text: string): string[] {
  return normalizeTags(text.split(/[,、]/));
}

function parseTagList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return normalizeTags(value.filter((item): item is string => typeof item === 'string'));
  }

  if (typeof value === 'string') {
    return normalizeTags([value]);
  }

  return [];
}

export function parseEventTags(item: Record<string, unknown>): string[] {
  if (Object.prototype.hasOwnProperty.call(item, 'tags')) {
    return parseTagList(item.tags);
  }

  if (typeof item.tag === 'string') {
    const tag = item.tag.trim();
    return tag ? [tag] : [];
  }

  return [];
}

export function uniqueEventTags(events: Event[]): string[] {
  const seen = new Set<string>();

  for (const event of events) {
    for (const tag of event.tags) {
      seen.add(tag);
    }
  }

  return [...seen].sort((a, b) => a.localeCompare(b, 'ja'));
}

export function eventMatchesTags(event: Event, selected: string[]): boolean {
  if (selected.length === 0) {
    return true;
  }

  return selected.some((tag) => event.tags.includes(tag));
}

export function filterEventsByTags(events: Event[], selected: string[]): Event[] {
  if (selected.length === 0) {
    return events;
  }

  return events.filter((event) => eventMatchesTags(event, selected));
}
