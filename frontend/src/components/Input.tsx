import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ disabled = false, className = '', error, ...props }, ref) => {
    const baseClasses = 'rounded-md shadow-sm focus:ring focus:ring-opacity-50'
    const normalClasses = 'border-gray-300 focus:border-indigo-300 focus:ring-indigo-200'
    const errorClasses = 'border-red-300 focus:border-red-300 focus:ring-red-200'
    
    const classes = `${baseClasses} ${error ? errorClasses : normalClasses} ${className}`.trim()
    
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={classes}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input