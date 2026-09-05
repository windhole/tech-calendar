import { Link, NavLink } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { formatLastUpdated } from '@/utils/formatLastUpdated';

interface AppHeaderProps {
  eventsUpdatedAt: Date | null;
  onToday?: () => void;
}

export function AppHeader({ eventsUpdatedAt, onToday }: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__title">
        <CalendarIcon className="h-8 w-8 text-primary" />
        <div className="app-header__title-text">
          <h1>techカレンダー</h1>
          <p className="app-header__meta">{formatLastUpdated(eventsUpdatedAt)}</p>
        </div>
      </Link>
      <div className="app-header__toolbar">
        {onToday ? (
          <div className="app-header__today">
            <button type="button" className="app-today-button" onClick={onToday}>
              今日
            </button>
          </div>
        ) : null}
        <nav className="app-header__views" aria-label="表示切替">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' app-nav-link--active' : ''}`
            }
          >
            カレンダー表示
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' app-nav-link--active' : ''}`
            }
          >
            リスト表示
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
