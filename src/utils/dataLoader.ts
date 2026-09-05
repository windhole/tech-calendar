import { load } from 'js-yaml';
import { eventYamlSources } from 'virtual:event-yaml-sources';
import { Event } from '@/types';
import {
  eventSourceCaption,
  mergeEventLayers,
  sortEventYamlSources,
} from '@/utils/mergeEvents';
import { fetchPublicYaml, type LoadYamlOptions } from '@/utils/yamlFetch';

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

export type LoadedEvents = {
  events: Event[];
  sourceModifiedAt: Date | null;
  sourceCaption: string;
};

function modifiedAtFromResponse(response: Response): Date | null {
  const raw = response.headers.get('Last-Modified');
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseEventsYaml(text: string, sourceName: string): Event[] {
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
    });
  }

  return events;
}

function laterDate(current: Date | null, candidate: Date | null): Date | null {
  if (!candidate) {
    return current;
  }
  if (!current || candidate > current) {
    return candidate;
  }
  return current;
}

export async function loadEvents(
  options: LoadYamlOptions = {}
): Promise<LoadedEvents> {
  const sources = sortEventYamlSources(eventYamlSources);

  if (sources.length === 0) {
    console.error('public/ に events*.yaml がありません');
    return { events: [], sourceModifiedAt: null, sourceCaption: 'イベントデータ' };
  }

  try {
    const layers = await Promise.all(
      sources.map(async (source) => {
        const response = await fetchPublicYaml(source.name, options);
        if (!response.ok) {
          console.error(`Failed to load ${source.name}:`, response.status);
          return { ok: false, name: source.name, events: [] as Event[], modifiedAt: null as Date | null };
        }

        const headerDate = modifiedAtFromResponse(response);
        const fallbackDate = new Date(source.mtimeMs);
        return {
          ok: true,
          name: source.name,
          events: parseEventsYaml(await response.text(), source.name),
          modifiedAt:
            headerDate ?? (Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate),
        };
      })
    );

    const loaded = layers.filter((layer) => layer.ok);
    let sourceModifiedAt: Date | null = null;
    for (const layer of loaded) {
      sourceModifiedAt = laterDate(sourceModifiedAt, layer.modifiedAt);
    }

    return {
      events: mergeEventLayers(loaded.map((layer) => layer.events)),
      sourceModifiedAt,
      sourceCaption: eventSourceCaption(loaded.map((layer) => layer.name)),
    };
  } catch (error) {
    console.error('Failed to load events:', error);
    return { events: [], sourceModifiedAt: null, sourceCaption: 'イベントデータ' };
  }
}
