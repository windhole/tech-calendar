import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  filterEventsByRegions,
  isEventRegion,
  regionsInEvents,
} from '@/events/regions';
import type { Event, EventRegion } from '@/types';

const REGION_PARAM = 'region';

function selectedRegionsFromSearch(searchParams: URLSearchParams): EventRegion[] {
  const seen = new Set<EventRegion>();
  const selected: EventRegion[] = [];

  for (const value of searchParams.getAll(REGION_PARAM)) {
    const region = value.trim();
    if (!isEventRegion(region) || seen.has(region)) {
      continue;
    }
    seen.add(region);
    selected.push(region);
  }

  return selected;
}

export function useEventRegionFilter(events: Event[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const uniqueRegions = useMemo(() => regionsInEvents(events), [events]);
  const selectedRegions = useMemo(
    () => selectedRegionsFromSearch(searchParams),
    [searchParams]
  );
  const filteredEvents = useMemo(
    () => filterEventsByRegions(events, selectedRegions),
    [events, selectedRegions]
  );

  const setSelectedRegions = (regions: EventRegion[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete(REGION_PARAM);
    for (const region of regions) {
      next.append(REGION_PARAM, region);
    }
    setSearchParams(next, { replace: true });
  };

  const toggleRegion = (region: EventRegion) => {
    if (selectedRegions.includes(region)) {
      setSelectedRegions(selectedRegions.filter((selected) => selected !== region));
      return;
    }

    setSelectedRegions([...selectedRegions, region]);
  };

  const clearRegions = () => {
    setSelectedRegions([]);
  };

  return {
    uniqueRegions,
    selectedRegions,
    filteredEvents,
    toggleRegion,
    clearRegions,
  };
}
