/** Google カレンダーで ICS を購読する確認画面の URL。cid には webcal:// の URL を渡す */
export function googleCalendarSubscribeUrl(icsUrl: string): string {
  const webcal = icsUrl.replace(/^https?:\/\//, 'webcal://');
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`;
}
