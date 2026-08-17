import { useState } from "react"
import { motherboards } from "@/data/motherboards"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { MotherboardCard } from "./MotherboardCard"
import { MotherboardExplorer } from "./MotherboardExplorer"
import { cn } from "@/lib/utils"
import { useLessonProgress } from "@/context/LessonProgressContext"

export function HardwareExploration() {
  const [selectedId, setSelectedId] = useState(motherboards[0].id)
  const { goToSection } = useLessonProgress()
  const selected = motherboards.find((b) => b.id === selectedId) ?? motherboards[0]

  function handleExplore(id: string) {
    setSelectedId(id)
    goToSection("explorer")
  }

  return (
    <>
      <SectionShell id="gallery">
        <Reveal>
          <Kicker>Placas do laboratório</Kicker>
          <SectionHeading className="max-w-2xl">
            Cinco gerações reais, do Socket 5 ao chip único.
          </SectionHeading>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {motherboards.map((board, i) => (
            <MotherboardCard
              key={board.id}
              board={board}
              onExplore={handleExplore}
              delay={i * 0.05}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="explorer" tone="muted">
        <Reveal>
          <Kicker>Investigação visual</Kicker>
          <SectionHeading className="max-w-2xl">
            Toque nos componentes e decida você mesmo.
          </SectionHeading>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Escolher placa">
          {motherboards.map((board) => (
            <button
              key={board.id}
              role="tab"
              aria-selected={selectedId === board.id}
              onClick={() => setSelectedId(board.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                selectedId === board.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {board.model}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <MotherboardExplorer board={selected} />
        </div>
      </SectionShell>
    </>
  )
}
