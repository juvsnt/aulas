import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { casesForLevel } from "@/data/challenges"
import { getBoard } from "@/data/motherboards"

export function DependsExplanation() {
  const cases = casesForLevel(3)

  return (
    <SectionShell id="depends">
      <Reveal>
        <Kicker>A categoria mais importante</Kicker>
        <SectionHeading className="max-w-2xl">Quando a resposta é "Depende"</SectionHeading>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Algumas características atravessam os dois níveis ao mesmo tempo.
          Nesses casos, o importante não é escolher um lado — é explicar qual
          parte pertence a cada um.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cases.map((c, i) => {
          const board = getBoard(c.boardId)
          return (
            <Reveal key={c.id} delay={i * 0.06}>
              <div className="overflow-hidden rounded-2xl border border-depends/40">
                <div className="bg-depends-soft px-5 py-3">
                  <p className="text-xs font-mono text-depends/80">
                    {board ? `${board.manufacturer} ${board.model}` : c.boardId}
                  </p>
                  <p className="mt-0.5 font-medium text-foreground/90">“{c.evidence}”</p>
                </div>
                <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="bg-arch-soft p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-arch">
                      Arquitetura
                    </p>
                    <p className="mt-1.5 text-sm text-arch/90">{c.archNote}</p>
                  </div>
                  <div className="bg-org-soft p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-org">
                      Organização
                    </p>
                    <p className="mt-1.5 text-sm text-org/90">{c.orgNote}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}
