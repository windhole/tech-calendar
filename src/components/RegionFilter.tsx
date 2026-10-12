import googleCalendarIcon from '@/assets/google-calendar.svg';
import { googleCalendarSubscribeUrl } from '@/events/googleCalendar';
import type { EventRegion } from '@/types';

function eventsIcsUrl(): string {
  return new URL(`${import.meta.env.BASE_URL}events.ics`, window.location.origin).href;
}

interface RegionFilterProps {
  regions: EventRegion[];
  selectedRegions: EventRegion[];
  onToggle: (region: EventRegion) => void;
  onClear: () => void;
}

export function RegionFilter({
  regions,
  selectedRegions,
  onToggle,
  onClear,
}: RegionFilterProps) {
  if (regions.length === 0) {
    return null;
  }

  const allActive = selectedRegions.length === 0;

  return (
    <div className="region-filter" role="group" aria-label="開催地で絞り込み">
      <button
        type="button"
        className={`region-filter__chip${allActive ? ' region-filter__chip--active' : ''}`}
        aria-pressed={allActive}
        onClick={onClear}
      >
        すべて
      </button>
      {regions.map((region) => {
        const active = selectedRegions.includes(region);

        return (
          <button
            key={region}
            type="button"
            className={`region-filter__chip${active ? ' region-filter__chip--active' : ''}`}
            aria-pressed={active}
            onClick={() => onToggle(region)}
          >
            {region}
          </button>
        );
      })}
      <a
        className="region-filter__chip region-filter__gcal"
        href={googleCalendarSubscribeUrl(eventsIcsUrl())}
        target="_blank"
        rel="noopener noreferrer"
        title="全イベントを Google カレンダーで購読します（開催地の絞り込みは反映されません）"
      >
        <img src={googleCalendarIcon} alt="Google カレンダー" width={16} height={16} />
        追加
      </a>
    </div>
  );
}
