import { memo, type InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', id: propId, ...props }, ref): React.JSX.Element => {
    const autoId = useId()
    const id = propId || autoId

    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-[12px] text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full py-2 px-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-[13px] font-sans bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15 ${className}`}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
