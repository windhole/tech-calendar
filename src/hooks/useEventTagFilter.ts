import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterEventsByTags, uniqueEventTags } from '@/events/tags';
import type { Event } from '@/types';

const TAG_PARAM = 'tag';

function selectedTagsFromSearch(searchParams: URLSearchParams): string[] {
  return Array.from(
    new Set(
      searchParams
        .getAll(TAG_PARAM)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    )
  );
}

export function useEventTagFilter(events: Event[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const uniqueTags = useMemo(() => uniqueEventTags(events), [events]);
  const selectedTags = useMemo(
    () => selectedTagsFromSearch(searchParams),
    [searchParams]
  );
  const filteredEvents = useMemo(
    () => filterEventsByTags(events, selectedTags),
    [events, selectedTags]
  );

  const setSelectedTags = (tags: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete(TAG_PARAM);
    for (const tag of tags) {
      next.append(TAG_PARAM, tag);
    }
    setSearchParams(next, { replace: true });
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((selected) => selected !== tag));
      return;
    }

    setSelectedTags([...selectedTags, tag]);
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  return {
    uniqueTags,
    selectedTags,
    filteredEvents,
    toggleTag,
    clearTags,
  };
}
