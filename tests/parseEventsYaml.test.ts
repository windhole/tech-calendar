import { describe, expect, test } from 'bun:test';
import { parseEventsYaml } from '../src/events/parseEventsYaml';

describe('parseEventsYaml', () => {
  test('必須項目がそろった行だけを読む', () => {
    const yaml = `
- startDate: "2026-09-05"
  endDate: "2026-09-06"
  eventName: Maker Faire Tokyo 2026
  location: 東京（有明）
  url: https://makezine.jp/event/mft2026/about/
  region: 東京
- startDate: "2026-09-08"
  endDate: "2026-09-08"
  eventName: URL が無い行
  location: オンライン
`;

    expect(parseEventsYaml(yaml, 'events.yaml')).toEqual([
      {
        startDate: '2026-09-05',
        endDate: '2026-09-06',
        eventName: 'Maker Faire Tokyo 2026',
        location: '東京（有明）',
        url: 'https://makezine.jp/event/mft2026/about/',
        region: '東京',
      },
    ]);
  });

  test('引用符の無い日付も YYYY-MM-DD にする', () => {
    const yaml = `
- startDate: 2026-09-05
  endDate: 2026-09-05
  eventName: A
  location: B
  url: https://example.com/
`;

    const [event] = parseEventsYaml(yaml, 'events.yaml');
    expect(event.startDate).toBe('2026-09-05');
    expect(event.region).toBeNull();
  });

  test('リストでなければ空', () => {
    expect(parseEventsYaml('foo: bar', 'events.yaml')).toEqual([]);
  });
});
