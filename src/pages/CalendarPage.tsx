import { useMemo, useState } from 'react';
import { MonthlyCalendar, getCalendarRange, loadHolidays } from '@/calendar';
import { AppHeader } from '@/components/AppHeader';
import { EventList } from '@/components/EventList';
import { Button } from '@/components/ui/button';
import { eventOverlapsRange } from '@/events/range';
import type { Event } from '@/types';

const holidays = loadHolidays();

function formatRangeLabel(start: string, end: string): string {
  const toLabel = (iso: string) => {
    const [year, month, day] = iso.split('-');
    return `${Number(year)}年${Number(month)}月${Number(day)}日`;
  };
  return `${toLabel(start)} 〜 ${toLabel(end)}`;
}

interface CalendarPageProps {
  events: Event[];
}

export function CalendarPage({ events }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const monthLabel = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;

  return (
    <div className="app-shell__inner">
      <AppHeader
        actions={
          <Button onClick={() => setCurrentDate(new Date())}>今日</Button>
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
