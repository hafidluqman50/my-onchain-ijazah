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
          'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
          variant === 'primary' &&
            'bg-[#c79635] text-white hover:bg-[#b3841f]',
          variant === 'outline' &&
            'border border-border bg-transparent text-foreground hover:bg-muted hover:border-border',
          variant === 'ghost' && 'bg-transparent text-foreground hover:bg-muted',
          variant === 'info' &&
            'bg-[#2563eb] text-white hover:bg-[#1d4ed8]',
          variant === 'success' &&
            'bg-[#16a34a] text-white hover:bg-[#15803d]',
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
