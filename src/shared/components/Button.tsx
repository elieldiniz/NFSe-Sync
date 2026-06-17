import { memo, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue text-white border-blue hover:bg-blue-dark',
  secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
  danger: 'bg-red-light dark:bg-red/20 text-red border-red-light dark:border-red/30 hover:bg-red/10 dark:hover:bg-red/30'
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-[12px] py-1.5 px-2.5',
  md: 'text-[13px] py-1.5 px-3.5'
}

export const Button = memo(function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      className={`btn rounded-md border cursor-pointer inline-flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
})
