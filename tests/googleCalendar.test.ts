import { describe, expect, test } from 'bun:test';
import { googleCalendarSubscribeUrl } from '../src/events/googleCalendar';

describe('googleCalendarSubscribeUrl', () => {
  test('ICS の URL を webcal:// にして cid に入れる', () => {
    const url = new URL(
      googleCalendarSubscribeUrl('https://windhole.github.io/tech-calendar/events.ics')
    );

    expect(url.origin).toBe('https://calendar.google.com');
    expect(url.pathname).toBe('/calendar/render');
    expect(url.searchParams.get('cid')).toBe(
      'webcal://windhole.github.io/tech-calendar/events.ics'
    );
  });

  test('http でも webcal:// にする', () => {
    const url = new URL(googleCalendarSubscribeUrl('http://localhost:5173/tech-calendar/events.ics'));

    expect(url.searchParams.get('cid')).toBe('webcal://localhost:5173/tech-calendar/events.ics');
  });
});
