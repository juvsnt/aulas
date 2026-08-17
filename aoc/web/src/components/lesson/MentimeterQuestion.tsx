import { useState } from "react"
import { Flame } from "lucide-react"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { mentimeterQuestions } from "@/data/challenges"
import { CATEGORY_LABEL, CATEGORY_ICON } from "./category"
import type { Category } from "@/data/types"
import { cn } from "@/lib/utils"

const CATS: Category[] = ["architecture", "organization", "depends"]

function VoteCard({ prompt, controversial }: { prompt: string; controversial?: boolean }) {
  const [vote, setVote] = useState<Category | null>(null)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium leading-snug">“{prompt}”</p>
        {controversial && (
          <span
            title="Pergunta controversa"
            className="flex shrink-0 items-center gap-1 rounded-full bg-org-soft px-2 py-0.5 text-[10px] font-semibold text-org"
          >
            <Flame className="size-3" aria-hidden />
            polêmica
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {CATS.map((c) => {
          const Icon = CATEGORY_ICON[c]
          return (
            <button
              key={c}
              onClick={() => setVote(c)}
              aria-pressed={vote === c}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-colors",
                vote === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden />
              {CATEGORY_LABEL[c]}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Sua escolha fica só neste dispositivo — a votação de verdade acontece
        no Mentimeter, em aula.
      </p>
    </div>
  )
}

export function MentimeterQuestion() {
  return (
    <SectionShell id="mentimeter">
      <Reveal>
        <Kicker>Vamos decidir juntos?</Kicker>
        <SectionHeading className="max-w-2xl">
          Perguntas para votação coletiva em sala.
        </SectionHeading>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Vote com sua primeira impressão. Depois, na aula presencial,
          discutiremos a distribuição de respostas antes de revelar a
          classificação.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {mentimeterQuestions.map((q, i) => (
          <Reveal key={q.id} delay={i * 0.05}>
            <VoteCard prompt={q.prompt} controversial={q.controversial} />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  )
}
