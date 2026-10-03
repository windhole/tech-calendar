import { describe, expect, test } from 'bun:test';
import { buildEventsIcs, escapeIcsText, foldIcsLine } from '../src/events/ical';
import type { Event } from '../src/types';

const options = {
  calendarName: "windhole's tech calendar",
  generatedAt: new Date('2026-10-04T12:34:56Z'),
  uidDomain: 'windhole.github.io',
};

function event(overrides: Partial<Event> = {}): Event {
  return {
    startDate: '2026-09-05',
    endDate: '2026-09-06',
    eventName: 'Maker Faire Tokyo 2026',
    location: '東京（有明）',
    url: 'https://makezine.jp/event/mft2026/about/',
    region: '東京',
    ...overrides,
  };
}

/** 折り返しを戻して論理行にする（RFC 5545 3.1） */
function unfold(ics: string): string[] {
  return ics.replace(/\r\n /g, '').split('\r\n');
}

function vevents(ics: string): string[][] {
  const blocks: string[][] = [];
  let current: string[] | null = null;
  for (const line of unfold(ics)) {
    if (line === 'BEGIN:VEVENT') {
      current = [];
    } else if (line === 'END:VEVENT') {
      blocks.push(current ?? []);
      current = null;
    } else if (current) {
      current.push(line);
    }
  }
  return blocks;
}

describe('buildEventsIcs', () => {
  test('VCALENDAR で囲み、行末は CRLF', () => {
    const ics = buildEventsIcs([event()], options);
    const lines = unfold(ics);

    expect(lines[0]).toBe('BEGIN:VCALENDAR');
    expect(lines).toContain('VERSION:2.0');
    expect(lines).toContain('CALSCALE:GREGORIAN');
    expect(lines).toContain('METHOD:PUBLISH');
    expect(lines).toContain("X-WR-CALNAME:windhole's tech calendar");
    expect(lines.some((line) => line.startsWith('PRODID:'))).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  test('終日イベントとして出し、DTEND は終了日の翌日', () => {
    const [vevent] = vevents(buildEventsIcs([event()], options));

    expect(vevent).toContain('DTSTART;VALUE=DATE:20260905');
    expect(vevent).toContain('DTEND;VALUE=DATE:20260907');
    expect(vevent).toContain('DTSTAMP:20261004T123456Z');
  });

  test('DTEND は月末・年末をまたぐ', () => {
    const ics = buildEventsIcs(
      [
        event({ startDate: '2026-09-30', endDate: '2026-09-30', eventName: 'A' }),
        event({ startDate: '2026-12-31', endDate: '2026-12-31', eventName: 'B' }),
      ],
      options
    );
    const [a, b] = vevents(ics);

    expect(a).toContain('DTEND;VALUE=DATE:20261001');
    expect(b).toContain('DTEND;VALUE=DATE:20270101');
  });

  test('名前・会場・URL・開催地を入れる', () => {
    const [vevent] = vevents(buildEventsIcs([event()], options));

    expect(vevent).toContain('SUMMARY:Maker Faire Tokyo 2026');
    expect(vevent).toContain('LOCATION:東京（有明）');
    expect(vevent).toContain('URL:https://makezine.jp/event/mft2026/about/');
    expect(vevent).toContain(
      'DESCRIPTION:https://makezine.jp/event/mft2026/about/\\n開催地: 東京'
    );
  });

  test('開催地が無ければ DESCRIPTION は URL だけ', () => {
    const [vevent] = vevents(buildEventsIcs([event({ region: null })], options));

    expect(vevent).toContain('DESCRIPTION:https://makezine.jp/event/mft2026/about/');
  });

  test('UID は開始日と名前で決まり、ビルドをまたいで変わらない', () => {
    const uid = (ics: string) =>
      vevents(ics)[0].find((line) => line.startsWith('UID:'));

    const first = uid(buildEventsIcs([event()], options));
    const rebuilt = uid(
      buildEventsIcs([event({ location: '別の会場' })], {
        ...options,
        generatedAt: new Date('2027-01-01T00:00:00Z'),
      })
    );
    const renamed = uid(buildEventsIcs([event({ eventName: '別のイベント' })], options));
    const moved = uid(buildEventsIcs([event({ startDate: '2026-09-04' })], options));

    expect(first).toMatch(/^UID:[A-Za-z0-9-]+@windhole\.github\.io$/);
    expect(rebuilt).toBe(first);
    expect(renamed).not.toBe(first);
    expect(moved).not.toBe(first);
  });

  test('開始日順に並べる', () => {
    const ics = buildEventsIcs(
      [
        event({ startDate: '2026-10-01', endDate: '2026-10-01', eventName: 'later' }),
        event({ startDate: '2026-09-01', endDate: '2026-09-01', eventName: 'earlier' }),
      ],
      options
    );
    const summaries = vevents(ics).map((v) => v.find((line) => line.startsWith('SUMMARY:')));

    expect(summaries).toEqual(['SUMMARY:earlier', 'SUMMARY:later']);
  });

  test('長い日本語の行も 75 オクテット以内に折り返す', () => {
    const longName = 'とても長いイベント名'.repeat(20);
    const ics = buildEventsIcs([event({ eventName: longName })], options);
    const encoder = new TextEncoder();

    for (const line of ics.split('\r\n')) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(vevents(ics)[0]).toContain(`SUMMARY:${longName}`);
  });
});

describe('escapeIcsText', () => {
  test('バックスラッシュ・セミコロン・カンマ・改行をエスケープする', () => {
    expect(escapeIcsText('a\\b;c,d\ne\r\nf')).toBe('a\\\\b\\;c\\,d\\ne\\nf');
  });
});

describe('foldIcsLine', () => {
  test('75 オクテット以下ならそのまま', () => {
    const line = 'x'.repeat(75);
    expect(foldIcsLine(line)).toBe(line);
  });

  test('マルチバイト文字の途中では切らない', () => {
    const line = `SUMMARY:${'あ'.repeat(40)}`;
    const parts = foldIcsLine(line).split('\r\n');

    expect(parts.length).toBeGreaterThan(1);
    for (const part of parts) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
      expect(part).not.toContain('�');
    }
    expect(parts.slice(1).every((part) => part.startsWith(' '))).toBe(true);
    expect(parts.map((part, i) => (i === 0 ? part : part.slice(1))).join('')).toBe(line);
  });
});
