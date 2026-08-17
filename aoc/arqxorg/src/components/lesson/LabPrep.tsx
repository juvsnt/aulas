import { Eye, ScanSearch, BookOpen, HelpCircle, ListChecks, MessageSquareText } from "lucide-react"
import { SectionShell, Reveal, SectionHeading } from "@/components/layout/SectionShell"

const steps = [
  { icon: Eye, label: "Observar" },
  { icon: ScanSearch, label: "Identificar" },
  { icon: BookOpen, label: "Consultar" },
  { icon: HelpCircle, label: "Questionar" },
  { icon: ListChecks, label: "Classificar" },
  { icon: MessageSquareText, label: "Justificar" },
]

export function LabPrep() {
  return (
    <SectionShell id="lab-prep" tone="dark">
      <Reveal>
        <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
          Preparação para a prática
        </p>
        <SectionHeading>Agora saia da tela.</SectionHeading>
        <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
          Você vai aprender de verdade quando aplicar o método em uma placa
          física, no laboratório.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12 flex flex-wrap gap-3">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-2 text-sm"
          >
            <s.icon className="size-4" aria-hidden />
            {s.label}
            {i < steps.length - 1 && <span className="text-primary-foreground/40">→</span>}
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.2} className="mt-12 overflow-x-auto rounded-2xl border border-primary-foreground/20">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-primary-foreground/10">
              {["Evidência", "Arquitetura", "Organização", "Depende", "Justificativa"].map(
                (h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-t border-primary-foreground/10">
                {Array.from({ length: 5 }).map((_, i) => (
                  <td key={i} className="p-4 text-primary-foreground/30">
                    —
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
      <p className="mt-3 text-xs text-primary-foreground/50">
        Modelo de registro para preencher com a placa física em mãos.
      </p>
    </SectionShell>
  )
}
