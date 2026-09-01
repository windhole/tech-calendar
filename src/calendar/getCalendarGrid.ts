import { formatIsoDate } from './formatIsoDate';
import type { CalendarDay, Holiday } from './types';

function startOfMondayWeek(date: Date): Date {
  const weekday = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekday);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 対象月を含む 6 週間（月曜始まり）。
 * 例: 2026年8月 → 2026-07-27（月）〜 2026-09-06（日）
 */
export function getCalendarGrid(
  year: number,
  monthIndex: number,
  holidays: Holiday[],
  today: Date = new Date()
): CalendarDay[] {
  const holidayMap = new Map(holidays.map((holiday) => [holiday.date, holiday.name]));
  const firstOfMonth = new Date(year, monthIndex, 1);
  const gridStart = startOfMondayWeek(firstOfMonth);
  const days: CalendarDay[] = [];

  for (let offset = 0; offset < 42; offset += 1) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + offset
    );
    const iso = formatIsoDate(date);
    const weekday = ((date.getDay() + 6) % 7) as CalendarDay['weekday'];
    const holidayName = holidayMap.get(iso);

    days.push({
      date,
      iso,
      inCurrentMonth: date.getMonth() === monthIndex,
      weekday,
      isSaturday: weekday === 5,
      isSunday: weekday === 6,
      isToday: isSameDay(date, today),
      holidayName,
    });
  }

  return days;
}
