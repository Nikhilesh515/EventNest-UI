import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

interface FocusTrapOptions {
  active: boolean
  onEscape?: () => void
  returnFocus?: HTMLElement | null
  initialFocus?: HTMLElement | null
}

export function useFocusTrap<T extends HTMLElement>(
  options: FocusTrapOptions,
): RefObject<T | null> {
  const { active, onEscape, returnFocus, initialFocus } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
    ;(initialFocus ?? focusables[0] ?? node).focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.stopPropagation()
        onEscape()
        return
      }
      if (event.key !== 'Tab') return
      const current = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (current.length === 0) {
        event.preventDefault()
        return
      }
      const first = current[0]
      const last = current[current.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      ;(returnFocus ?? previouslyFocused)?.focus()
    }
  }, [active, onEscape, returnFocus, initialFocus])

  return ref
}
