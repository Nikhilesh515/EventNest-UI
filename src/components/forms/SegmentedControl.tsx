import type { IconName } from '@/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/icons/Icon'

interface SegmentedOption {
  value: string
  label?: string
  icon?: IconName
  ariaLabel?: string
}

interface SegmentedControlProps {
  ariaLabel: string
  value: string
  options: SegmentedOption[]
  onChange(value: string): void
}

export function SegmentedControl({ ariaLabel, value, options, onChange }: SegmentedControlProps) {
  return (
    <div className="seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const checked = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.ariaLabel ?? option.label}
            className={cn('seg__btn')}
            onClick={() => onChange(option.value)}
          >
            {option.icon ? <Icon name={option.icon} size={16} /> : null}
            {option.label ? <span>{option.label}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
