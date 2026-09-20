import { useEffect, useMemo, useState } from 'react';
import {
  MonthlyCalendar,
  clearHolidayCache,
  getCalendarRange,
  loadHolidaysForYears,
  yearsCoveredByRange,
  type Holiday,
} from '@/calendar';
import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { EventList } from '@/components/EventList';
import { eventOverlapsRange } from '@/events/range';
import { useEventRegionFilter } from '@/hooks/useEventRegionFilter';
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
  eventsUpdatedAt: Date | null;
  onReloadEvents: () => void | Promise<void>;
}

export function CalendarPage({
  events,
  eventsUpdatedAt,
  onReloadEvents,
}: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const { uniqueRegions, selectedRegions, filteredEvents, toggleRegion, clearRegions } =
    useEventRegionFilter(events);

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
      filteredEvents
        .filter((event) => eventOverlapsRange(event, range.start, range.end))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [filteredEvents, range]
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

  return (
    <div className="app-shell__inner">
      <AppHeader
        eventsUpdatedAt={eventsUpdatedAt}
        onToday={handleToday}
        uniqueRegions={uniqueRegions}
        selectedRegions={selectedRegions}
        onToggleRegion={toggleRegion}
        onClearRegions={clearRegions}
      />

      <div className="app-layout">
        <MonthlyCalendar
          currentDate={currentDate}
          holidays={holidays}
          events={filteredEvents}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <EventList
          events={visibleEvents}
          title={`この期間のイベント（${formatRangeLabel(range.start, range.end)}）`}
          emptyMessage={
            selectedRegions.length > 0
              ? 'この開催地のイベントはありません'
              : 'この期間にイベントはありません'
          }
        />
      </div>

      <AppFooter>windhole's tech calendar（2026年9月〜）</AppFooter>
    </div>
  );
}
