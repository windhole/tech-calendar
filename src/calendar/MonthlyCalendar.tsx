import type { Event } from '@/types';
import { formatIsoDate } from './formatIsoDate';
import { getCalendarGrid } from './getCalendarGrid';
import type { Holiday } from './types';
import './monthly-calendar.css';

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'] as const;

interface MonthlyCalendarProps {
  currentDate: Date;
  holidays: Holiday[];
  events?: Event[];
  selectedDate: Date | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateSelect: (date: Date) => void;
}

function cellClassName(options: {
  isSaturday: boolean;
  isSunday: boolean;
  holidayName?: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
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
  if (options.isSelected) {
    classes.push('monthly-calendar__cell--selected');
  }

  return classes.join(' ');
}

export function MonthlyCalendar({
  currentDate,
  holidays,
  events = [],
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
}: MonthlyCalendarProps) {
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const days = getCalendarGrid(year, monthIndex, holidays);
  const selectedIso = selectedDate ? formatIsoDate(selectedDate) : null;

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
          const isSelected = selectedIso === day.iso;

          return (
            <button
              key={day.iso}
              type="button"
              className={cellClassName({
                isSaturday: day.isSaturday,
                isSunday: day.isSunday,
                holidayName: day.holidayName,
                inCurrentMonth: day.inCurrentMonth,
                isToday: day.isToday,
                isSelected,
              })}
              onClick={() => onDateSelect(day.date)}
              aria-pressed={isSelected}
              aria-current={day.isToday ? 'date' : undefined}
            >
              <span className="monthly-calendar__date">{day.date.getDate()}</span>
              {day.holidayName ? (
                <span className="monthly-calendar__holiday">{day.holidayName}</span>
              ) : null}
              {dateEvents.length > 0 ? (
                <div className="monthly-calendar__events">
                  {dateEvents.slice(0, 2).map((event) => (
                    <div key={event.eventName} className="monthly-calendar__event">
                      {event.eventName}
                    </div>
                  ))}
                  {dateEvents.length > 2 ? (
                    <div className="monthly-calendar__event-more">
                      +{dateEvents.length - 2}件
                    </div>
                  ) : null}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
