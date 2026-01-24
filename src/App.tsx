import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/Calendar';
import { EventList } from '@/components/EventList';
import { Button } from '@/components/ui/button';
import { Event, Holiday } from '@/types';
import { loadEvents, loadHolidays } from '@/utils/dataLoader';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [loadedEvents, loadedHolidays] = await Promise.all([
        loadEvents(),
        loadHolidays(),
      ]);
      setEvents(loadedEvents);
      setHolidays(loadedHolidays);
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const clearSelection = () => {
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">
                イベントカレンダー
              </h1>
            </div>
            <div className="flex gap-2">
              {selectedDate && (
                <Button variant="outline" onClick={clearSelection}>
                  選択をクリア
                </Button>
              )}
              <Button onClick={handleToday}>今日</Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar
              currentDate={currentDate}
              events={events}
              holidays={holidays}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
          <div className="lg:col-span-1">
            <EventList events={events} selectedDate={selectedDate} />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>日本の祝日に対応したイベントカレンダー</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
