import { Home, Quote } from "lucide-react"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { conceptQuotes } from "@/data/concepts"

export function ConceptComparison() {
  const mainQuote = conceptQuotes.find((q) => q.id === "stallings-def")!
  const exampleQuote = conceptQuotes.find((q) => q.id === "stallings-example")!

  return (
    <SectionShell id="concept">
      <Reveal>
        <Kicker>Conceito fundamental</Kicker>
        <SectionHeading className="max-w-2xl">
          O que o computador oferece, e como ele faz isso.
        </SectionHeading>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-2xl border border-arch/30 bg-arch-soft p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-arch">Arquitetura</p>
            <p className="mt-2 font-display text-2xl font-semibold text-arch">
              O que o computador oferece.
            </p>
            <p className="mt-3 text-sm text-foreground/80">
              As capacidades e comportamentos visíveis a quem programa: quais
              instruções existem, como os dados são endereçados, o que o
              sistema promete fazer.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-full rounded-2xl border border-org/30 bg-org-soft p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-org">Organização</p>
            <p className="mt-2 font-display text-2xl font-semibold text-org">
              Como o computador implementa.
            </p>
            <p className="mt-3 text-sm text-foreground/80">
              As unidades físicas e suas interconexões: qual chip faz o quê,
              quantos slots existem, como os sinais realmente circulam.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.15} className="mt-14 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Home className="mt-1 size-6 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-display text-lg font-semibold">Uma analogia rápida: a casa</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-arch">Arquitetura da casa</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>quantidade de quartos</li>
                  <li>finalidade dos espaços</li>
                  <li>acessos e circulação</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-org">Organização da casa</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>materiais de construção</li>
                  <li>fiação elétrica</li>
                  <li>encanamento e disposição estrutural</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No computador, a ideia é a mesma: a arquitetura descreve o que
              existe e para que serve; a organização descreve como isso foi
              fisicamente construído.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2} className="mt-10 border-l-2 border-primary pl-6">
        <Quote className="size-5 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-balance text-lg leading-relaxed text-foreground/90">
          “{mainQuote.quote}”
        </p>
        <p className="mt-3 text-xs text-muted-foreground">{mainQuote.source}</p>
      </Reveal>

      <Reveal delay={0.25} className="mt-8 rounded-2xl bg-secondary p-6">
        <p className="text-sm font-semibold">Exemplo clássico</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {exampleQuote.quote}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">{exampleQuote.source}</p>
      </Reveal>
    </SectionShell>
  )
}
