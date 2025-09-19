import { InputHTMLAttributes, ReactNode } from 'react'

/**
 * Enhanced Input component with label, error states, and icon support
 * @example
 * <Input 
 *   label="Email" 
 *   type="email" 
 *   error={errors.email}
 *   leftIcon={<Mail className="w-4 h-4" />}
 * />
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label text */
  label?: string
  /** Error message to display */
  error?: string
  /** Icon to display on the left side */
  leftIcon?: ReactNode
  /** Icon to display on the right side */
  rightIcon?: ReactNode
  /** Helper text to display below input */
  helperText?: string
}

export default function Input({ 
  label, 
  error, 
  leftIcon, 
  rightIcon, 
  helperText, 
  className = '', 
  ...props 
}: InputProps) {
  const hasError = Boolean(error)
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={props.id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          type="text"
          className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            leftIcon ? 'pl-10' : ''
          } ${
            rightIcon ? 'pr-10' : ''
          } ${
            hasError 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
          } ${className}`}
          id={props.id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}