import { Daruma } from './Mascots';

interface EmptyStateProps {
  title: string;
  body: string;
  cta?: React.ReactNode;
  kanji?: string;
  painted?: boolean;
}

export function EmptyState({ title, body, cta, kanji, painted = false }: EmptyStateProps) {
  return (
    <div className="empty" role="status">
      <div className="empty__mascot" aria-hidden="true">
        <Daruma painted={painted} />
      </div>
      <h2 className="empty__title">{title}</h2>
      <p className="empty__body">{body}</p>
      {cta && <div className="cluster">{cta}</div>}
      {kanji && (
        <span className="empty__kanji kanji-watermark" aria-hidden="true" lang="ja">
          {kanji}
        </span>
      )}
    </div>
  );
}
