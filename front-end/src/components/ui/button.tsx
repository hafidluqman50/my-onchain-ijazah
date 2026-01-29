import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'primary' | 'outline' | 'ghost' | 'info' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium leading-tight whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer',
          'disabled:pointer-events-none disabled:opacity-100 disabled:bg-[#e3d8c6] disabled:text-[#6d5b3e] disabled:shadow-none',
          variant === 'primary' &&
            'bg-primary text-primaryForeground hover:bg-[#22365d] hover:text-[#fff7e6] shadow-[0_4px_10px_rgba(27,42,74,0.12)] hover:shadow-[0_6px_14px_rgba(27,42,74,0.18)]',
          variant === 'outline' &&
            'border border-[#e3d3a9] bg-white text-foreground hover:bg-[#fff4dd] hover:text-[#3a2c14] hover:border-[#d8c08e]',
          variant === 'ghost' && 'bg-transparent text-foreground hover:bg-muted',
          variant === 'info' &&
            'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-[0_4px_10px_rgba(37,99,235,0.18)]',
          variant === 'success' &&
            'bg-[#16a34a] text-white hover:bg-[#15803d] shadow-[0_4px_10px_rgba(22,163,74,0.18)]',
          size === 'sm' && 'h-10 px-6',
          size === 'md' && 'h-11 px-6',
          size === 'lg' && 'h-12 px-7',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
