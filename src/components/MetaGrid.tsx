interface MetaItem {
  icon: string;
  label: string;
  value: string;
  datetime?: string;
  className?: string;
}

interface MetaGridProps {
  items: MetaItem[];
}

export function MetaGrid({ items }: MetaGridProps) {
  return (
    <dl className="meta-grid">
      {items.map((item, i) => (
        <div key={i} className="meta-row">
          <dt>
            <span className="icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </dt>
          <dd className={item.className}>
            {item.datetime ? (
              <time dateTime={item.datetime}>{item.value}</time>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
