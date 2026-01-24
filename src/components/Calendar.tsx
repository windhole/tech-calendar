import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Event, Holiday } from '@/types';
import {
  getMonthDays,
  formatDate,
  isToday,
  isSameMonth,
  isDateInRange,
} from '@/utils/dateUtils';

interface CalendarProps {
  currentDate: Date;
  events: Event[];
  holidays: Holiday[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function Calendar({
  currentDate,
  events,
  holidays,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  selectedDate,
}: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  const holidayMap = new Map(holidays.map((h) => [h.date, h.name]));

  const getEventsForDate = (date: Date) => {
    return events.filter((event) =>
      isDateInRange(date, event.startDate, event.endDate)
    );
  };

  const isSunday = (date: Date) => date.getDay() === 0;
  const isSaturday = (date: Date) => date.getDay() === 6;

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {year}年 {month + 1}月
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevMonth}
            aria-label="前月"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            aria-label="次月"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-semibold py-2',
              index === 0 && 'text-red-600',
              index === 6 && 'text-blue-600'
            )}
          >
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, month);
          const dateEvents = getEventsForDate(date);
          const holiday = holidayMap.get(formatDate(date));
          const isSelected =
            selectedDate && formatDate(date) === formatDate(selectedDate);

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={cn(
                'min-h-[80px] p-2 rounded-lg border transition-all hover:border-primary hover:shadow-md',
                isCurrentMonth ? 'bg-white' : 'bg-gray-50',
                isToday(date) && 'border-primary border-2',
                isSelected && 'bg-blue-50 border-blue-500',
                'flex flex-col items-start'
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium mb-1',
                  !isCurrentMonth && 'text-gray-400',
                  isToday(date) && 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center',
                  (isSunday(date) || holiday) && isCurrentMonth && !isToday(date) && 'text-red-600',
                  isSaturday(date) && isCurrentMonth && !isToday(date) && !holiday && 'text-blue-600'
                )}
              >
                {date.getDate()}
              </span>
              {holiday && isCurrentMonth && (
                <span className="text-xs text-red-600 font-medium mb-1">
                  {holiday}
                </span>
              )}
              {dateEvents.length > 0 && isCurrentMonth && (
                <div className="w-full space-y-1">
                  {dateEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={i}
                      className="text-xs bg-blue-500 text-white rounded px-1 py-0.5 truncate"
                      title={event.eventName}
                    >
                      {event.eventName}
                    </div>
                  ))}
                  {dateEvents.length > 2 && (
                    <div className="text-xs text-gray-600">
                      +{dateEvents.length - 2}件
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
