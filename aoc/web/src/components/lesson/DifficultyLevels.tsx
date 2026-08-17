import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { casesForLevel } from "@/data/challenges"
import { getBoard } from "@/data/motherboards"
import { EvidenceCard } from "./EvidenceCard"

const levels = [
  { value: "1", level: 1 as const, tab: "Nível 1", title: "Nível 1 — Evidente", desc: "Características claramente ligadas à implementação física." },
  { value: "2", level: 2 as const, tab: "Nível 2", title: "Nível 2 — Raciocínio", desc: "É preciso entender a função do componente antes de classificar." },
  { value: "3", level: 3 as const, tab: "Nível 3", title: "Nível 3 — Zona cinzenta", desc: "Casos que envolvem os dois níveis ao mesmo tempo." },
]

export function DifficultyLevels() {
  return (
    <SectionShell id="difficulty-levels" tone="muted">
      <Reveal>
        <Kicker>Desafios</Kicker>
        <SectionHeading className="max-w-2xl">Três níveis de dificuldade.</SectionHeading>
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <Tabs defaultValue="1">
          <TabsList className="w-full sm:w-auto">
            {levels.map((l) => (
              <TabsTrigger key={l.value} value={l.value}>
                {l.tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {levels.map((l) => (
            <TabsContent key={l.value} value={l.value} className="mt-6">
              <p className="font-display text-lg font-semibold">{l.title}</p>
              <p className="mb-5 mt-1 text-sm text-muted-foreground">{l.desc}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {casesForLevel(l.level).map((c) => {
                  const board = getBoard(c.boardId)
                  const label = board ? `${board.manufacturer} ${board.model}` : c.boardId
                  return (
                    <EvidenceCard
                      key={c.id}
                      id={c.id}
                      boardLabel={label}
                      evidence={c.evidence}
                      category={c.category}
                      reason={c.reason}
                      archNote={c.archNote}
                      orgNote={c.orgNote}
                      source={c.source}
                    />
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Reveal>
    </SectionShell>
  )
}
