import { useEffect, useMemo, useState } from 'react';
import {
  MonthlyCalendar,
  clearHolidayCache,
  getCalendarRange,
  loadHolidaysForYears,
  yearsCoveredByRange,
  type Holiday,
} from '@/calendar';
import { AppHeader } from '@/components/AppHeader';
import { EventList } from '@/components/EventList';
import { Button } from '@/components/ui/button';
import { eventOverlapsRange } from '@/events/range';
import type { Event } from '@/types';

function formatRangeLabel(start: string, end: string): string {
  const toLabel = (iso: string) => {
    const [year, month, day] = iso.split('-');
    return `${Number(year)}年${Number(month)}月${Number(day)}日`;
  };
  return `${toLabel(start)} 〜 ${toLabel(end)}`;
}

interface CalendarPageProps {
  events: Event[];
  onReloadEvents: () => void | Promise<void>;
}

export function CalendarPage({ events, onReloadEvents }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const range = useMemo(
    () => getCalendarRange(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate]
  );

  const visibleEvents = useMemo(
    () =>
      events
        .filter((event) => eventOverlapsRange(event, range.start, range.end))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events, range]
  );

  useEffect(() => {
    const years = yearsCoveredByRange(range.start, range.end);
    let cancelled = false;

    loadHolidaysForYears(years).then((loaded) => {
      if (!cancelled) {
        setHolidays(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [range]);

  const handleToday = () => {
    const today = new Date();
    const todayRange = getCalendarRange(today.getFullYear(), today.getMonth());
    const years = yearsCoveredByRange(todayRange.start, todayRange.end);

    void (async () => {
      clearHolidayCache();
      const loaded = await loadHolidaysForYears(years, { bypassCache: true });
      setHolidays(loaded);
      setCurrentDate(today);
      await onReloadEvents();
    })();
  };

  const monthLabel = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;

  return (
    <div className="app-shell__inner">
      <AppHeader
        actions={
          <Button onClick={handleToday}>今日</Button>
        }
      />

      <div className="app-layout">
        <MonthlyCalendar
          currentDate={currentDate}
          holidays={holidays}
          events={events}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <EventList
          events={visibleEvents}
          title={`この期間のイベント（${formatRangeLabel(range.start, range.end)}）`}
          emptyMessage="この期間にイベントはありません"
        />
      </div>

      <footer className="app-footer">
        <p>日本の祝日に対応したイベントカレンダー（{monthLabel}）</p>
      </footer>
    </div>
  );
}
