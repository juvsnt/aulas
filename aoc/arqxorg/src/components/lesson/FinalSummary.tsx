import { Cpu, Wrench, Split } from "lucide-react"
import { SectionShell, Reveal, Kicker } from "@/components/layout/SectionShell"

const cards = [
  {
    icon: Cpu,
    title: "Arquitetura",
    desc: "O que o computador apresenta funcionalmente.",
    tone: "arch" as const,
  },
  {
    icon: Wrench,
    title: "Organização",
    desc: "Como isso é implementado.",
    tone: "org" as const,
  },
  {
    icon: Split,
    title: "Depende",
    desc: "Quando uma característica envolve os dois níveis.",
    tone: "depends" as const,
  },
]

const toneClasses = {
  arch: "border-arch/30 bg-arch-soft text-arch",
  org: "border-org/30 bg-org-soft text-org",
  depends: "border-depends/30 bg-depends-soft text-depends",
}

export function FinalSummary() {
  return (
    <SectionShell id="summary">
      <Reveal>
        <Kicker>Síntese</Kicker>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <div className={`h-full rounded-2xl border p-6 ${toneClasses[c.tone]}`}>
              <c.icon className="size-8" aria-hidden />
              <p className="mt-4 font-display text-xl font-semibold">{c.title}</p>
              <p className="mt-2 text-sm opacity-90">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3} className="mt-16 text-center">
        <p className="mx-auto max-w-3xl text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Não classifique o componente.
          <br />
          Classifique aquilo que está sendo afirmado sobre ele.
        </p>
      </Reveal>
    </SectionShell>
  )
}
