// vite.config.ts（ビルド時の events.ics 生成）からも読むので、@/ ではなく相対パスで import する
import type { Event } from '../types';
import { eventIdentityKey } from '../utils/mergeEvents';

export type BuildEventsIcsOptions = {
  calendarName: string;
  /** DTSTAMP に使う。ビルドした時刻 */
  generatedAt: Date;
  /** UID の @ の後ろ */
  uidDomain: string;
};

const MAX_LINE_OCTETS = 75;
const encoder = new TextEncoder();

/** RFC 5545 3.3.11 の TEXT 値のエスケープ */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** RFC 5545 3.1 の折り返し。75 オクテットごとに CRLF + 空白を入れ、文字の途中では切らない */
export function foldIcsLine(line: string): string {
  if (encoder.encode(line).length <= MAX_LINE_OCTETS) {
    return line;
  }

  const parts: string[] = [];
  let current = '';
  let octets = 0;
  // 2 行目以降は先頭の空白 1 オクテットぶん短い
  let limit = MAX_LINE_OCTETS;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (octets + size > limit) {
      parts.push(current);
      current = '';
      octets = 0;
      limit = MAX_LINE_OCTETS - 1;
    }
    current += char;
    octets += size;
  }
  parts.push(current);

  return parts.join('\r\n ');
}

function icsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/** DTEND は排他的なので、終日イベントは終了日の翌日を入れる */
function nextIcsDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10).replace(/-/g, '');
}

function icsTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function fnv1a32(bytes: Uint8Array, seed: number): string {
  let hash = seed;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** 同じ開始日・同じ名前なら同じ UID（mergeEventLayers と同じ同一性）。購読側で重複しないように固定する */
function eventUid(event: Event, domain: string): string {
  const bytes = encoder.encode(eventIdentityKey(event));
  return `${event.startDate}-${fnv1a32(bytes, 0x811c9dc5)}${fnv1a32(bytes, 0x050c5d1f)}@${domain}`;
}

function eventDescription(event: Event): string {
  const lines = [event.url];
  if (event.region) {
    lines.push(`開催地: ${event.region}`);
  }
  return lines.join('\n');
}

export function buildEventsIcs(events: Event[], options: BuildEventsIcsOptions): string {
  const dtstamp = icsTimestamp(options.generatedAt);
  const sorted = [...events].sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) || a.eventName.localeCompare(b.eventName)
  );

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//windhole//tech-calendar//JA`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(options.calendarName)}`,
    'X-WR-TIMEZONE:Asia/Tokyo',
  ];

  for (const event of sorted) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${eventUid(event, options.uidDomain)}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${icsDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${nextIcsDate(event.endDate)}`,
      `SUMMARY:${escapeIcsText(event.eventName)}`,
      `LOCATION:${escapeIcsText(event.location)}`,
      `URL:${event.url}`,
      `DESCRIPTION:${escapeIcsText(eventDescription(event))}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}
