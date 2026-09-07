import { useMemo } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { EventList } from '@/components/EventList';
import { formatIsoDate } from '@/calendar';
import { isUpcomingEvent } from '@/events/range';
import { useEventRegionFilter } from '@/hooks/useEventRegionFilter';
import type { Event } from '@/types';

interface AllEventsPageProps {
  events: Event[];
  eventsUpdatedAt: Date | null;
}

export function AllEventsPage({
  events,
  eventsUpdatedAt,
}: AllEventsPageProps) {
  const today = formatIsoDate(new Date());
  const { uniqueRegions, selectedRegions, filteredEvents, toggleRegion, clearRegions } =
    useEventRegionFilter(events);

  const { upcoming, past } = useMemo(() => {
    const upcomingEvents = filteredEvents
      .filter((event) => isUpcomingEvent(event, today))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const pastEvents = filteredEvents
      .filter((event) => !isUpcomingEvent(event, today))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
    return { upcoming: upcomingEvents, past: pastEvents };
  }, [filteredEvents, today]);

  return (
    <div className="app-shell__inner">
      <AppHeader
        eventsUpdatedAt={eventsUpdatedAt}
        uniqueRegions={uniqueRegions}
        selectedRegions={selectedRegions}
        onToggleRegion={toggleRegion}
        onClearRegions={clearRegions}
      />

      <div className="app-layout">
        <EventList
          events={upcoming}
          title="今日以降のイベント"
          showCount
          emptyMessage={
            selectedRegions.length > 0
              ? 'この開催地のイベントはありません'
              : '今日以降のイベントはありません'
          }
        />
        <EventList
          events={past}
          title="過去のイベント"
          emptyMessage={
            selectedRegions.length > 0
              ? 'この開催地のイベントはありません'
              : '過去のイベントはありません'
          }
        />
      </div>

      <footer className="app-footer">
        <p>すべてのイベント（今日 {today} を先頭）</p>
      </footer>
    </div>
  );
}
