import { Calendar as CalendarIcon, ExternalLink, MapPin, Tags } from 'lucide-react';
import type { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatEventDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

function formatEventDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatEventDate(startDate);
  }
  return `${formatEventDate(startDate)} 〜 ${formatEventDate(endDate)}`;
}

interface EventDetailDialogProps {
  event: Event | null;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, onOpenChange }: EventDetailDialogProps) {
  return (
    <Dialog open={event !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {event ? (
          <>
            <DialogHeader>
              <DialogTitle>{event.eventName}</DialogTitle>
              <DialogDescription className="sr-only">
                イベントの開催日、会場、タグ、詳細 URL
              </DialogDescription>
            </DialogHeader>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <dt className="sr-only">開催日</dt>
                <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <dd>{formatEventDateRange(event.startDate, event.endDate)}</dd>
              </div>
              <div className="flex items-start gap-2">
                <dt className="sr-only">会場</dt>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <dd>{event.location}</dd>
              </div>
              {event.tags.length > 0 ? (
                <div className="flex items-start gap-2">
                  <dt className="sr-only">タグ</dt>
                  <Tags className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <dd className="flex flex-wrap gap-1.5">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
            {event.url ? (
              <Button variant="outline" asChild>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  イベントサイトを開く
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
