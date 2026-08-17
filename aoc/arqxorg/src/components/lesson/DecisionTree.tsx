import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { CategoryBadge } from "./category"

const questions = [
  {
    n: 1,
    question:
      "Essa característica define uma capacidade ou comportamento relevante ao software/programador?",
    result: "architecture" as const,
    resultLabel: "Se sim: possível Arquitetura.",
  },
  {
    n: 2,
    question: "Ela descreve como essa capacidade foi fisicamente implementada?",
    result: "organization" as const,
    resultLabel: "Se sim: possível Organização.",
  },
  {
    n: 3,
    question: "A característica envolve simultaneamente interface e implementação?",
    result: "depends" as const,
    resultLabel: "Resultado: Depende.",
  },
]

export function DecisionTree() {
  return (
    <SectionShell id="decision-tree" tone="muted" narrow>
      <Reveal>
        <Kicker>Regra de decisão</Kicker>
        <SectionHeading>Um pequeno roteiro para começar a pensar.</SectionHeading>
      </Reveal>

      <div className="relative mt-12 space-y-6 border-l-2 border-border pl-8">
        {questions.map((q, i) => (
          <Reveal key={q.n} delay={i * 0.1}>
            <div className="relative">
              <span className="absolute -left-[calc(2rem+9px)] top-1 flex size-4 items-center justify-center rounded-full border-2 border-primary bg-background text-[10px] font-bold" />
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="font-mono text-xs text-muted-foreground">Pergunta {q.n}</p>
                <p className="mt-1 font-medium">{q.question}</p>
                <div className="mt-3 flex items-center gap-2">
                  <CategoryBadge category={q.result} />
                  <span className="text-sm text-muted-foreground">{q.resultLabel}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.4} className="mt-8 text-sm text-muted-foreground">
        Essa regra é uma orientação didática, não uma lei rígida — o objetivo
        é treinar sua argumentação, não decorar uma tabela.
      </Reveal>
    </SectionShell>
  )
}
