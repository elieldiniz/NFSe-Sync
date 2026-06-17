import { memo } from 'react'

type BadgeVariant = 'ok' | 'warn' | 'err' | 'run' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  ok: 'bg-green-light dark:bg-green/20 text-green-dark dark:text-green-light',
  warn: 'bg-amber-light dark:bg-amber/20 text-amber-dark dark:text-amber-light',
  err: 'bg-red-light dark:bg-red/20 text-red-dark dark:text-red-light',
  run: 'bg-blue-light dark:bg-blue/20 text-blue-dark dark:text-blue-light',
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
}

export const Badge = memo(function Badge({ variant = 'default', children, className = '' }: BadgeProps): React.JSX.Element {
  return (
    <span
      className={`badge text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
})
