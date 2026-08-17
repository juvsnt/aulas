import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { comparisons } from "@/data/comparisons"
import { getBoard } from "@/data/motherboards"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function ComparisonCard({ comparison, delay }: { comparison: (typeof comparisons)[number]; delay: number }) {
  const [revealed, setRevealed] = useState(false)
  const boardA = getBoard(comparison.boardAId)!
  const boardB = getBoard(comparison.boardBId)!

  return (
    <Reveal delay={delay}>
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-display text-lg font-semibold">{comparison.title}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { board: boardA, key: "a" as const },
            { board: boardB, key: "b" as const },
          ].map(({ board, key }) => (
            <div key={board.id} className="rounded-xl bg-secondary p-4">
              <p className="text-sm font-semibold">
                {board.manufacturer} {board.model}
              </p>
              <dl className="mt-3 space-y-1.5 text-xs">
                {comparison.fields.map((f) => (
                  <div key={f.label} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd className="text-right font-medium">{key === "a" ? f.a : f.b}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={() => setRevealed((v) => !v)}
          aria-expanded={revealed}
        >
          O que mudou: arquitetura ou organização?
          <ChevronDown className={cn("transition-transform", revealed && "rotate-180")} />
        </Button>

        {revealed && (
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <p className="rounded-lg bg-arch-soft p-3 text-arch">
              <strong>Arquitetura:</strong> {comparison.archNote}
            </p>
            <p className="rounded-lg bg-org-soft p-3 text-org">
              <strong>Organização:</strong> {comparison.orgNote}
            </p>
          </div>
        )}
      </div>
    </Reveal>
  )
}

export function MotherboardComparison() {
  return (
    <SectionShell id="comparison" tone="muted">
      <Reveal>
        <Kicker>Comparação direta</Kicker>
        <SectionHeading className="max-w-2xl">
          Pares que isolam exatamente o que mudou.
        </SectionHeading>
      </Reveal>

      <div className="mt-10 space-y-6">
        {comparisons.map((c, i) => (
          <ComparisonCard key={c.id} comparison={c} delay={i * 0.08} />
        ))}
      </div>
    </SectionShell>
  )
}
