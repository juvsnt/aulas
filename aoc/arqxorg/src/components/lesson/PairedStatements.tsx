import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { pairedStatements } from "@/data/challenges"
import { getBoard } from "@/data/motherboards"
import { EvidenceCard } from "./EvidenceCard"

export function PairedStatements() {
  return (
    <SectionShell id="paired-statements">
      <Reveal>
        <Kicker>A formulação importa</Kicker>
        <SectionHeading className="max-w-2xl">
          Duas frases parecidas podem pedir análises diferentes.
        </SectionHeading>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Classifique as duas afirmações de cada par antes de continuar.
          Repare no que muda entre a versão específica e a versão geral.
        </p>
      </Reveal>

      <div className="mt-10 space-y-10">
        {pairedStatements.map((pair, i) => {
          const board = getBoard(pair.boardId)
          const label = board ? `${board.manufacturer} ${board.model}` : pair.boardId
          return (
            <Reveal key={pair.id} delay={i * 0.08}>
              <div className="grid gap-4 sm:grid-cols-2">
                <EvidenceCard
                  id={`${pair.id}-a`}
                  boardLabel={label}
                  evidence={pair.specific}
                  category={pair.specificCategory}
                  reason={pair.specificReason}
                  source={pair.source}
                />
                <EvidenceCard
                  id={`${pair.id}-b`}
                  boardLabel={label}
                  evidence={pair.general}
                  category={pair.generalCategory}
                  reason={pair.generalReason}
                  source={pair.source}
                />
              </div>
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}
