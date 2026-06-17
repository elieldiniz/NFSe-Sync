import { memo, type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = memo(function Card({ children, className = '' }: CardProps): React.JSX.Element {
  return (
    <div className={`w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
})
