import { Eye, ScanSearch, BookOpen, HelpCircle, ListChecks, MessageSquareText } from "lucide-react"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"

const steps = [
  {
    icon: Eye,
    title: "Observar",
    description: "Examine fisicamente a placa: componentes, chips, sockets, slots, conectores, inscrições.",
    example: "Na Gateway MBDPCI016AAWW, você vê um encaixe quadrado bege e vários slots compridos.",
  },
  {
    icon: ScanSearch,
    title: "Identificar",
    description: "Descubra o que cada elemento observado representa.",
    example: "O encaixe quadrado é um soquete de processador; os slots pretos compridos são ISA, os cremes menores são PCI.",
  },
  {
    icon: BookOpen,
    title: "Consultar",
    description: "Use o manual da placa para entender função, capacidade, tecnologia, limitações e compatibilidade.",
    example: "A ficha do produto confirma: Socket 5, chipset Intel 430FX, memória SIMM de 72 vias.",
  },
  {
    icon: HelpCircle,
    title: "Questionar",
    description:
      "Pergunte: estamos analisando uma capacidade/interface que o computador oferece, ou a maneira concreta usada para implementá-la?",
    example: "Ter exatamente 3 slots PCI é sobre implementação — não sobre o que o software pode fazer.",
  },
  {
    icon: ListChecks,
    title: "Classificar",
    description: "Escolha: Arquitetura, Organização ou Depende.",
    example: "A contagem de slots PCI → Organização.",
  },
  {
    icon: MessageSquareText,
    title: "Justificar",
    description: "Explique a escolha com uma frase curta.",
    example: "\"É uma decisão física do fabricante sobre quantos conectores caber na placa.\"",
  },
]

export function InvestigationFlow() {
  return (
    <SectionShell id="method">
      <Reveal>
        <Kicker>Método de investigação</Kicker>
        <SectionHeading className="max-w-2xl">
          Um roteiro que você vai aplicar sozinho no laboratório.
        </SectionHeading>
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono text-muted-foreground">
        {steps.map((s, i) => (
          <span key={s.title} className="flex items-center gap-2">
            {s.title.toUpperCase()}
            {i < steps.length - 1 && <span aria-hidden>→</span>}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <step.icon className="size-5" aria-hidden />
              </div>
              <p className="mt-4 font-display text-lg font-semibold">
                {i + 1}. {step.title}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              <p className="mt-3 rounded-lg bg-secondary p-3 text-xs text-secondary-foreground/80">
                {step.example}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  )
}
