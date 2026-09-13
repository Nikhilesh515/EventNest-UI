import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/cn'

interface ConfettiProps {
  count?: number
  className?: string
}

export function Confetti({ count = 18, className }: ConfettiProps) {
  const [pieces, setPieces] = useState<number[]>([])
  useEffect(() => {
    setPieces(Array.from({ length: count }, (_, i) => i))
  }, [count])
  return (
    <span className={cn('confetti', className)} aria-hidden="true">
      {pieces.map((piece) => (
        <span key={piece} className="confetti__piece" style={{ '--i': piece } as CSSProperties} />
      ))}
    </span>
  )
}
