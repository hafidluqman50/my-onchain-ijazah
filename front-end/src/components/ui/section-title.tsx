import { cn } from '@/lib/utils'

export function SectionTitle({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
      {subtitle ? <p className="text-sm text-mutedForeground md:text-base">{subtitle}</p> : null}
    </div>
  )
}
