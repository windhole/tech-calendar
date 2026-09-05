import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AllEventsPage } from '@/pages/AllEventsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { Event } from '@/types';
import { loadEvents } from '@/utils/dataLoader';
import './App.css';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsUpdatedAt, setEventsUpdatedAt] = useState<Date | null>(null);
  const [eventsSourceCaption, setEventsSourceCaption] = useState('イベントデータ');
  const [loading, setLoading] = useState(true);

  const applyLoadedEvents = async (bypassCache = false) => {
    const loaded = await loadEvents(bypassCache ? { bypassCache: true } : {});
    setEvents(loaded.events);
    setEventsUpdatedAt(loaded.sourceModifiedAt);
    setEventsSourceCaption(loaded.sourceCaption);
  };

  const reloadEvents = async () => {
    await applyLoadedEvents(true);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await applyLoadedEvents(false);
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
        <Route
          path="/"
          element={
            <CalendarPage
              events={events}
              eventsUpdatedAt={eventsUpdatedAt}
              eventsSourceCaption={eventsSourceCaption}
              onReloadEvents={reloadEvents}
            />
          }
        />
        <Route
          path="/events"
          element={
            <AllEventsPage
              events={events}
              eventsUpdatedAt={eventsUpdatedAt}
              eventsSourceCaption={eventsSourceCaption}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
