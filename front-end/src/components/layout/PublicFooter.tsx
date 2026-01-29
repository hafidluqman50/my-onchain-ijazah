import { Container } from '@/components/ui/container'

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-[#e3d3a9] bg-transparent py-6 text-xs text-[#6d5b3e]">
      <Container className="flex flex-col items-start justify-between gap-2 md:flex-row">
        <p>© 2026 Onchain Ijazah.</p>
        <p>Privasi dijaga, verifikasi tetap mudah.</p>
      </Container>
    </footer>
  )
}
