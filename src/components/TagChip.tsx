import { currentColorMode, tagStyleVars } from '../lib/tag-style';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagChipProps {
  tag: Tag;
  tilt?: number | null;
  md?: boolean;
  className?: string;
}

export function TagChip({ tag, tilt = null, md = false, className }: TagChipProps) {
  const cls = ['tag-chip', md ? 'tag-chip--md' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <span
      className={cls}
      style={tagStyleVars(tag.color, currentColorMode(), tilt)}
      title={tag.name}
      aria-label={tag.name}
    >
      <span className="tag-chip__dot" aria-hidden="true" />
      <span className="tag-chip__label">{tag.name}</span>
    </span>
  );
}

interface TagChipListProps {
  tags: Tag[];
  max?: number;
  tilts?: number[] | null;
  md?: boolean;
}

export function TagChipList({ tags, max = 3, tilts = null, md = false }: TagChipListProps) {
  const shown = tags.slice(0, max);
  const extra = tags.slice(max);
  return (
    <>
      {shown.map((tag, i) => (
        <TagChip key={tag.id} tag={tag} tilt={tilts ? (tilts[i] ?? null) : null} md={md} />
      ))}
      {extra.length > 0 && (
        <span
          className={`tag-chip tag-chip--more${md ? ' tag-chip--md' : ''}`}
          title={extra.map((t) => t.name).join(', ')}
        >
          +{extra.length}
        </span>
      )}
    </>
  );
}
