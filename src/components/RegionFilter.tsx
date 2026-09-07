import type { EventRegion } from '@/types';

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
    </div>
  );
}
