import type { Event } from '@/types';

export type EventYamlSource = {
  name: string;
  mtimeMs: number;
};

export function eventIdentityKey(event: Pick<Event, 'startDate' | 'eventName'>): string {
  return `${event.startDate}\t${event.eventName}`;
}

export function sortEventYamlSources(sources: EventYamlSource[]): EventYamlSource[] {
  return [...sources].sort(
    (a, b) => a.mtimeMs - b.mtimeMs || a.name.localeCompare(b.name)
  );
}

/** layers は古いファイルから新しいファイルの順。同じ開始日・同じ名前は後の層が勝つ。 */
export function mergeEventLayers(layers: Event[][]): Event[] {
  const byKey = new Map<string, Event>();
  for (const layer of layers) {
    for (const event of layer) {
      byKey.set(eventIdentityKey(event), event);
    }
  }
  return [...byKey.values()];
}

export function eventSourceCaption(loadedNames: string[]): string {
  if (loadedNames.length === 0) {
    return 'イベントデータ';
  }
  if (loadedNames.length === 1) {
    return loadedNames[0];
  }
  const newest = loadedNames[loadedNames.length - 1];
  return `${newest} ほか${loadedNames.length - 1}件`;
}
