import { ExternalLink, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface EventListProps {
  events: Event[];
  selectedDate: Date | null;
}

export function EventList({ events, selectedDate }: EventListProps) {
  const filteredEvents = selectedDate
    ? events.filter((event) => {
        const dateStr = formatDate(selectedDate);
        return dateStr >= event.startDate && dateStr <= event.endDate;
      })
    : events;

  const sortedEvents = [...filteredEvents].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (startDate === endDate) {
      return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日`;
    }

    return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {selectedDate
            ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日のイベント`
            : 'すべてのイベント'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {selectedDate
              ? 'この日にイベントはありません'
              : 'イベントがありません'}
          </p>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{event.eventName}</h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDateRange(event.startDate, event.endDate)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>

                    {event.startDate === event.endDate ? (
                      <Badge variant="secondary">1日間</Badge>
                    ) : (
                      <Badge variant="secondary">
                        {Math.ceil(
                          (new Date(event.endDate).getTime() -
                            new Date(event.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}
                        日間
                      </Badge>
                    )}
                  </div>

                  {event.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="shrink-0"
                    >
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        詳細
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
