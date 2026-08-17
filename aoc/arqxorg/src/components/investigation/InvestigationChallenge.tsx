import { useState } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { motherboards } from "@/data/motherboards"
import { hotspotsForBoard } from "@/data/hotspots"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { ClassifyButtons, CategoryBadge } from "@/components/lesson/category"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useLessonProgress } from "@/context/LessonProgressContext"
import type { Category } from "@/data/types"

const MISSIONS = [
  "Encontre o subsistema de memória",
  "Encontre uma interface de expansão",
  "Encontre o chipset",
  "Encontre uma interface de armazenamento",
]

export function InvestigationChallenge() {
  const [boardId, setBoardId] = useState(motherboards[0].id)
  const [done, setDone] = useState<boolean[]>(() => MISSIONS.map(() => false))
  const board = motherboards.find((b) => b.id === boardId) ?? motherboards[0]
  const spots = hotspotsForBoard(boardId).slice(0, 2)

  function selectBoard(id: string) {
    setBoardId(id)
    setDone(MISSIONS.map(() => false))
  }

  return (
    <SectionShell id="investigation-mode" tone="muted">
      <Reveal>
        <Kicker>Modo investigação</Kicker>
        <SectionHeading className="max-w-2xl">Sua vez de investigar.</SectionHeading>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Escolha uma placa. Antes de qualquer explicação, complete as
          missões observando a imagem com atenção.
        </p>
      </Reveal>

      <div className="mt-8 flex flex-wrap gap-2">
        {motherboards.map((b) => (
          <button
            key={b.id}
            onClick={() => selectBoard(b.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              boardId === b.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {b.model}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={board.images.explorer}
              alt={`Placa ${board.model} para investigação`}
              className="w-full"
            />
          </div>
        </Reveal>

        <Reveal delay={0.05} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="font-display text-base font-semibold">Missões</p>
            <ul className="mt-3 space-y-2">
              {MISSIONS.map((mission, i) => (
                <li key={mission}>
                  <button
                    onClick={() =>
                      setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                    }
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-secondary"
                  >
                    {done[i] ? (
                      <CheckCircle2 className="size-5 shrink-0 text-lab-green" aria-hidden />
                    ) : (
                      <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                    <span className={cn(done[i] && "text-muted-foreground line-through")}>
                      {mission}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {spots.map((spot) => (
            <MissionQuiz key={spot.id} id={spot.id} label={spot.label} question={spot.question} category={spot.category} explanation={spot.explanation} />
          ))}
        </Reveal>
      </div>
    </SectionShell>
  )
}

function MissionQuiz({
  id,
  label,
  question,
  category,
  explanation,
}: {
  id: string
  label: string
  question: string
  category: Category
  explanation: string
}) {
  const { answers, setAnswer } = useLessonProgress()
  const answer = answers[`mission-${id}`]
  const [justification, setJustification] = useState(answer?.justification ?? "")

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-mono text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{question}</p>
      <div className="mt-3">
        <ClassifyButtons
          picked={answer?.category ?? null}
          onPick={(c) => setAnswer(`mission-${id}`, { category: c, justification })}
          size="sm"
        />
      </div>
      {answer && (
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-medium text-muted-foreground" htmlFor={`just-${id}`}>
            Por que você escolheu essa categoria? (opcional)
          </label>
          <Textarea
            id={`just-${id}`}
            value={justification}
            onChange={(e) => {
              setJustification(e.target.value)
              setAnswer(`mission-${id}`, { category: answer.category, justification: e.target.value })
            }}
            placeholder="Explique seu raciocínio em uma frase..."
          />
          <div className="flex items-center gap-2 border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">Nosso raciocínio:</span>
            <CategoryBadge category={category} />
          </div>
          <p className="text-sm text-foreground/80">{explanation}</p>
        </div>
      )}
    </div>
  )
}
