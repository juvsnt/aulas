import { BookOpen, FileText } from "lucide-react"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { motherboards, p5sbComparisonBoard } from "@/data/motherboards"

const books = [
  "Stallings — Arquitetura e Organização de Computadores, 10ª ed.",
  "Tanenbaum — Organização Estruturada de Computadores",
  "Patterson & Hennessy — Organização e Projeto de Computadores, 5ª ed.",
  "Gabriel Torres — Hardware: Curso Completo, 4ª ed.",
  "Arquitetura de Computadores — material introdutório (e-Tec Brasil)",
  "Ricarte — Organização de Computadores (UNICAMP, EA960)",
]

export function References() {
  const manuals = Array.from(
    new Set([...motherboards.map((b) => b.manual), p5sbComparisonBoard.manual])
  )

  return (
    <SectionShell id="references" tone="muted" narrow>
      <Reveal>
        <Kicker>Fontes e referências</Kicker>
        <SectionHeading>De onde vem cada informação.</SectionHeading>
      </Reveal>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <Reveal delay={0.05}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="size-4" aria-hidden />
            Livros consultados
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {books.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4" aria-hidden />
            Manuais e fichas de placas-mãe
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {manuals.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </SectionShell>
  )
}
