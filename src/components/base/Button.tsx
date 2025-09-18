import { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Reusable Button component with multiple variants and sizes
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content */
  children: ReactNode
  /** Button variant affecting visual style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  /** Button size affecting padding and font */
  size?: 'sm' | 'md' | 'lg'
  /** Whether button is in loading state */
  loading?: boolean
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled,
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-sm hover:shadow-md',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500 hover:border-gray-400',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}