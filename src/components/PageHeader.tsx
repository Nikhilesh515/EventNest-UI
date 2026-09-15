interface PageHeaderProps {
  overline?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tapeVariant?: string;
  cornerTape?: string | null;
  fullTape?: boolean;
  kanji?: string;
  className?: string;
}

export function PageHeader({
  overline,
  title,
  subtitle,
  actions,
  tapeVariant = 'sakura',
  cornerTape = 'sora',
  fullTape = false,
  kanji,
  className,
}: PageHeaderProps) {
  return (
    <header className={`page-doc${className ? ` ${className}` : ''}`}>
      <span
        className={`washi page-doc__tape washi--${tapeVariant}`}
        aria-hidden="true"
        style={fullTape ? ({ '--tape-page-w': '100%' } as React.CSSProperties) : undefined}
      />
      {cornerTape && (
        <span className={`washi page-doc__corner-tape washi--${cornerTape}`} aria-hidden="true" />
      )}
      {kanji && (
        <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">
          {kanji}
        </span>
      )}
      <div className="page-doc__head">
        {overline && <p className="page-doc__overline">{overline}</p>}
        <h1 className="page-doc__title">{title}</h1>
        {subtitle && <p className="page-doc__sub">{subtitle}</p>}
      </div>
      {actions && <div className="page-doc__actions">{actions}</div>}
    </header>
  );
}
