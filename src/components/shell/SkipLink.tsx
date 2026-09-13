export function SkipLink({ label = 'Skip to main content' }: { label?: string }) {
  return (
    <a className="skip-link" href="#main-view">
      {label}
    </a>
  )
}
