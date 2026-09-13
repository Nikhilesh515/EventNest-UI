import { useTheme } from '@/app/providers/ThemeContext'
import { Icon } from '@/components/icons/Icon'

interface ThemeToggleProps {
  variant?: 'rail' | 'topbar'
}

export function ThemeToggle({ variant = 'rail' }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  const label = dark ? 'Switch to festival day' : 'Switch to night stalls'

  if (variant === 'topbar') {
    return (
      <button
        type="button"
        className="icon-btn"
        aria-pressed={dark}
        aria-label={label}
        title={label}
        onClick={toggle}
      >
        <Icon name="moon-lantern" size={22} />
      </button>
    )
  }

  return (
    <button
      type="button"
      className="rail-theme"
      aria-pressed={dark}
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      <Icon name="moon-lantern" size={20} />
      <span className="rail-theme__label">{dark ? 'Festival day' : 'Night stalls'}</span>
    </button>
  )
}
