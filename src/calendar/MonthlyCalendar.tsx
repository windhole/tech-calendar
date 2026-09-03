import { useState } from 'react';
import type { Event } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EventDetailDialog } from './EventDetailDialog';
import { getCalendarGrid } from './getCalendarGrid';
import type { Holiday } from './types';
import './monthly-calendar.css';

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'] as const;

interface MonthlyCalendarProps {
  currentDate: Date;
  holidays: Holiday[];
  events?: Event[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function cellClassName(options: {
  isSaturday: boolean;
  isSunday: boolean;
  holidayName?: string;
  inCurrentMonth: boolean;
  isToday: boolean;
}): string {
  const classes = ['monthly-calendar__cell'];

  if (options.isSaturday) {
    classes.push('monthly-calendar__cell--saturday');
  }
  if (options.isSunday) {
    classes.push('monthly-calendar__cell--sunday');
  }
  if (options.holidayName) {
    classes.push('monthly-calendar__cell--holiday');
  }
  if (!options.inCurrentMonth) {
    classes.push('monthly-calendar__cell--outside');
  }
  if (options.isToday) {
    classes.push('monthly-calendar__cell--today');
  }

  return classes.join(' ');
}

export function MonthlyCalendar({
  currentDate,
  holidays,
  events = [],
  onPrevMonth,
  onNextMonth,
}: MonthlyCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const days = getCalendarGrid(year, monthIndex, holidays);

  const eventsByDate = (iso: string) =>
    events.filter((event) => iso >= event.startDate && iso <= event.endDate);

  return (
    <section className="monthly-calendar" aria-label="月間カレンダー">
      <div className="monthly-calendar__toolbar">
        <h2 className="monthly-calendar__title">
          {year}年 {monthIndex + 1}月
        </h2>
        <div className="monthly-calendar__nav">
          <button
            type="button"
            className="monthly-calendar__nav-button"
            onClick={onPrevMonth}
            aria-label="前月"
          >
            ‹
          </button>
          <button
            type="button"
            className="monthly-calendar__nav-button"
            onClick={onNextMonth}
            aria-label="次月"
          >
            ›
          </button>
        </div>
      </div>

      <div className="monthly-calendar__weekdays">
        {WEEKDAYS.map((label, index) => (
          <div
            key={label}
            className={[
              'monthly-calendar__weekday',
              index === 5 ? 'monthly-calendar__weekday--saturday' : '',
              index === 6 ? 'monthly-calendar__weekday--sunday' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="monthly-calendar__grid">
        {days.map((day) => {
          const dateEvents = eventsByDate(day.iso);

          return (
            <div
              key={day.iso}
              className={cellClassName({
                isSaturday: day.isSaturday,
                isSunday: day.isSunday,
                holidayName: day.holidayName,
                inCurrentMonth: day.inCurrentMonth,
                isToday: day.isToday,
              })}
              aria-current={day.isToday ? 'date' : undefined}
            >
              <span className="monthly-calendar__date">{day.date.getDate()}</span>
              {day.holidayName ? (
                <span className="monthly-calendar__holiday">{day.holidayName}</span>
              ) : null}
              {dateEvents.length > 0 ? (
                <div className="monthly-calendar__events">
                  {dateEvents.slice(0, 2).map((event, index) => (
                    <Tooltip
                      key={`${day.iso}-${event.startDate}-${event.eventName}-${index}`}
                      delayDuration={250}
                      open={selectedEvent ? false : undefined}
                    >
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="monthly-calendar__event"
                          onClick={() => setSelectedEvent(event)}
                        >
                          {event.eventName}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs whitespace-normal break-words text-left"
                      >
                        {event.eventName}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {dateEvents.length > 2 ? (
                    <div className="monthly-calendar__event-more">
                      +{dateEvents.length - 2}件
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <EventDetailDialog
        event={selectedEvent}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEvent(null);
          }
        }}
      />
    </section>
  );
}
