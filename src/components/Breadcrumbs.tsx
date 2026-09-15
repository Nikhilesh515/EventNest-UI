import { Link } from 'react-router';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="sep" aria-hidden="true">/</span>}
          {item.href ? (
            <Link to={item.href}>{item.label}</Link>
          ) : (
            <span className="current clamp-1">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
