import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AllEventsPage } from '@/pages/AllEventsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { Event } from '@/types';
import { loadEvents } from '@/utils/dataLoader';
import './App.css';

function App() {
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
      <Routes>
        <Route path="/" element={<CalendarPage events={events} />} />
        <Route path="/events" element={<AllEventsPage events={events} />} />
      </Routes>
    </div>
  );
}

export default App;
