import { cn } from '@/lib/cn'

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg'
  withHanko?: boolean
  className?: string
}

export function Wordmark({ size = 'md', withHanko, className }: WordmarkProps) {
  return (
    <span className={cn('wordmark', `wordmark--${size}`, className)}>
      <span className="wordmark__text">EventNest</span>
      {withHanko ? (
        <span className="wordmark__hanko hanko" aria-hidden="true">
          祭
        </span>
      ) : null}
    </span>
  )
}
