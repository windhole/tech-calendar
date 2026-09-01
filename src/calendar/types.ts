export interface Holiday {
  date: string;
  name: string;
}

export interface CalendarDay {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isSaturday: boolean;
  isSunday: boolean;
  isToday: boolean;
  holidayName?: string;
}
