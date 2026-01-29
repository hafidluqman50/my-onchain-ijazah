import { Container } from '@/components/ui/container'

export function Footer() {
  return (
    <footer className="border-t border-border bg-white/70 py-6 text-xs text-mutedForeground">
      <Container className="flex flex-col items-start justify-between gap-3 md:flex-row">
        <p>© 2026 Onchain Ijazah. All rights reserved.</p>
        <p>Privasi dijaga, verifikasi tetap mudah.</p>
      </Container>
    </footer>
  )
}
