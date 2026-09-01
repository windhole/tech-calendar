import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { MonthlyCalendar, loadHolidays } from '@/calendar';
import { EventList } from '@/components/EventList';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { loadEvents } from '@/utils/dataLoader';
import './App.css';

const holidays = loadHolidays();

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
      setLoading(false);
    };

    loadData();
  }, []);

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

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthLabel = useMemo(
    () => `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`,
    [currentDate]
  );

  if (loading) {
    return (
      <div className="app-shell app-shell--loading">
        <div className="app-loading">
          <div className="app-loading__spinner" />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-shell__inner">
        <header className="app-header">
          <div className="app-header__title">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1>イベントカレンダー</h1>
          </div>
          <div className="app-header__actions">
            {selectedDate && (
              <Button variant="outline" onClick={() => setSelectedDate(null)}>
                選択をクリア
              </Button>
            )}
            <Button onClick={handleToday}>今日</Button>
          </div>
        </header>

        <div className="app-layout">
          <MonthlyCalendar
            currentDate={currentDate}
            holidays={holidays}
            events={events}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
          <EventList events={events} selectedDate={selectedDate} />
        </div>

        <footer className="app-footer">
          <p>日本の祝日に対応したイベントカレンダー（{monthLabel}）</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
