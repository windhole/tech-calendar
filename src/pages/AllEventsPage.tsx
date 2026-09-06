import { useMemo } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { EventList } from '@/components/EventList';
import { formatIsoDate } from '@/calendar';
import { isUpcomingEvent } from '@/events/range';
import { useEventTagFilter } from '@/hooks/useEventTagFilter';
import type { Event } from '@/types';

interface AllEventsPageProps {
  events: Event[];
  eventsUpdatedAt: Date | null;
  eventsSourceCaption: string;
}

export function AllEventsPage({
  events,
  eventsUpdatedAt,
  eventsSourceCaption,
}: AllEventsPageProps) {
  const today = formatIsoDate(new Date());
  const { uniqueTags, selectedTags, filteredEvents, toggleTag, clearTags } =
    useEventTagFilter(events);

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
        eventsSourceCaption={eventsSourceCaption}
        uniqueTags={uniqueTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearTags={clearTags}
      />

      <div className="app-layout">
        <EventList
          events={upcoming}
          title="今日以降のイベント"
          emptyMessage={
            selectedTags.length > 0
              ? 'このタグのイベントはありません'
              : '今日以降のイベントはありません'
          }
        />
        <EventList
          events={past}
          title="過去のイベント"
          emptyMessage={
            selectedTags.length > 0
              ? 'このタグのイベントはありません'
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
