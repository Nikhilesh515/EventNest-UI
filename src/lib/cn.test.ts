import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins truthy classes and drops falsy ones', () => {
    const flags: Record<string, boolean> = { hidden: false, active: true }
    expect(cn('a', flags.hidden && 'b', undefined, 'c')).toBe('a c')
    expect(cn('a', flags.active && 'b', 'c')).toBe('a b c')
  })
})
