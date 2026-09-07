import { Link, NavLink, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { RegionFilter } from '@/components/RegionFilter';
import type { EventRegion } from '@/types';

function formatYamlStamp(date: Date | null, sourceCaption: string): string {
  if (!date) {
    return `${sourceCaption}  更新日時不明`;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${sourceCaption}  ${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface AppHeaderProps {
  eventsUpdatedAt: Date | null;
  eventsSourceCaption: string;
  onToday?: () => void;
  uniqueRegions?: EventRegion[];
  selectedRegions?: EventRegion[];
  onToggleRegion?: (region: EventRegion) => void;
  onClearRegions?: () => void;
}

export function AppHeader({
  eventsUpdatedAt,
  eventsSourceCaption,
  onToday,
  uniqueRegions = [],
  selectedRegions = [],
  onToggleRegion,
  onClearRegions,
}: AppHeaderProps) {
  const { search } = useLocation();

  return (
    <div className="app-header-block">
      <header className="app-header">
        <Link to={{ pathname: '/', search }} className="app-header__title">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <div className="app-header__title-text">
            <h1>techカレンダー</h1>
            <p className="app-header__meta">{formatYamlStamp(eventsUpdatedAt, eventsSourceCaption)}</p>
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
              to={{ pathname: '/', search }}
              end
              className={({ isActive }) =>
                `app-nav-link${isActive ? ' app-nav-link--active' : ''}`
              }
            >
              カレンダー表示
            </NavLink>
            <NavLink
              to={{ pathname: '/events', search }}
              className={({ isActive }) =>
                `app-nav-link${isActive ? ' app-nav-link--active' : ''}`
              }
            >
              リスト表示
            </NavLink>
          </nav>
        </div>
      </header>
      {onToggleRegion && onClearRegions ? (
        <RegionFilter
          regions={uniqueRegions}
          selectedRegions={selectedRegions}
          onToggle={onToggleRegion}
          onClear={onClearRegions}
        />
      ) : null}
    </div>
  );
}
