import { Link, NavLink } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface AppHeaderProps {
  actions?: ReactNode;
}

export function AppHeader({ actions }: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__title">
        <CalendarIcon className="h-8 w-8 text-primary" />
        <h1>イベントカレンダー</h1>
      </Link>
      <nav className="app-header__actions" aria-label="ページ">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `app-nav-link${isActive ? ' app-nav-link--active' : ''}`
          }
        >
          カレンダー
        </NavLink>
        <NavLink
          to="/events"
          className={({ isActive }) =>
            `app-nav-link${isActive ? ' app-nav-link--active' : ''}`
          }
        >
          すべてのイベント
        </NavLink>
        {actions}
      </nav>
    </header>
  );
}
