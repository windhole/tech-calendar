import { eventYamlSources } from 'virtual:event-yaml-sources';
import { parseEventsYaml } from '@/events/parseEventsYaml';
import { Event } from '@/types';
import {
  mergeEventLayers,
  sortEventYamlSources,
} from '@/utils/mergeEvents';
import { fetchPublicYaml, type LoadYamlOptions } from '@/utils/yamlFetch';

export type LoadedEvents = {
  events: Event[];
  sourceModifiedAt: Date | null;
};

function modifiedAtFromResponse(response: Response): Date | null {
  const raw = response.headers.get('Last-Modified');
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
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
    return { events: [], sourceModifiedAt: null };
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
    };
  } catch (error) {
    console.error('Failed to load events:', error);
    return { events: [], sourceModifiedAt: null };
  }
}
