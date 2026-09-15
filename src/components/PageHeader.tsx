interface PageHeaderProps {
  overline?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tapeWidth?: 'full' | 'default';
}

export function PageHeader({ overline, title, subtitle, actions, tapeWidth = 'default' }: PageHeaderProps) {
  return (
    <div className="page-doc">
      <div
        className={`page-doc__tape${tapeWidth === 'full' ? ' page-doc__tape--full' : ''}`}
        aria-hidden="true"
      />
      <div className="page-doc__corner-tape" aria-hidden="true" />
      <div className="page-doc__content">
        {overline && <p className="page-doc__overline">{overline}</p>}
        <div className="page-doc__title-row">
          <h1 className="page-doc__title">{title}</h1>
          {actions && <div className="page-doc__actions">{actions}</div>}
        </div>
        {subtitle && <p className="page-doc__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
