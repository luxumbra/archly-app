import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    type = 'submit', 
    className = '', 
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center border rounded-md font-semibold text-xs uppercase tracking-widest transition ease-in-out duration-150 focus:outline-none focus:ring disabled:opacity-25'
    
    const variantClasses = {
      primary: 'bg-gray-800 border-transparent text-white hover:bg-gray-700 active:bg-gray-900 focus:border-gray-900 focus:ring-gray-300',
      secondary: 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus:border-gray-300 focus:ring-gray-200',
      danger: 'bg-red-600 border-transparent text-white hover:bg-red-700 active:bg-red-800 focus:border-red-700 focus:ring-red-200',
      outline: 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:border-gray-300 focus:ring-gray-200'
    }
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-xs',
      lg: 'px-6 py-3 text-sm'
    }
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()
    
    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button