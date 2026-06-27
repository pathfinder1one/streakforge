import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-ember-gradient text-white shadow-ember-sm hover:shadow-ember hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-base-800 text-ash-100 border border-base-600 hover:border-ember-500/50 hover:bg-base-700',
  ghost: 'text-ash-300 hover:text-ember-300 hover:bg-base-800',
  danger: 'bg-base-800 text-red-400 border border-red-900/50 hover:bg-red-950/30 hover:border-red-700',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          font-medium transition-all duration-200 ease-out
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
