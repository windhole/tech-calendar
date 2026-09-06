interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export function TagFilter({
  tags,
  selectedTags,
  onToggle,
  onClear,
}: TagFilterProps) {
  if (tags.length === 0) {
    return null;
  }

  const allActive = selectedTags.length === 0;

  return (
    <div className="tag-filter" role="group" aria-label="タグで絞り込み">
      <button
        type="button"
        className={`tag-filter__chip${allActive ? ' tag-filter__chip--active' : ''}`}
        aria-pressed={allActive}
        onClick={onClear}
      >
        すべて
      </button>
      {tags.map((tag) => {
        const active = selectedTags.includes(tag);

        return (
          <button
            key={tag}
            type="button"
            className={`tag-filter__chip${active ? ' tag-filter__chip--active' : ''}`}
            aria-pressed={active}
            onClick={() => onToggle(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
