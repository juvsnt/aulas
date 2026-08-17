import type { Category } from "@/data/types"
import { CategoryBadge, ClassifyButtons } from "./category"
import { useLessonProgress } from "@/context/LessonProgressContext"

interface EvidenceCardProps {
  id: string
  boardLabel: string
  evidence: string
  category: Category
  reason: string
  archNote?: string
  orgNote?: string
  source: string
}

export function EvidenceCard({
  id,
  boardLabel,
  evidence,
  category,
  reason,
  archNote,
  orgNote,
  source,
}: EvidenceCardProps) {
  const { answers, setAnswer } = useLessonProgress()
  const picked = answers[id]?.category ?? null

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="font-mono text-xs text-muted-foreground">{boardLabel}</p>
      <p className="mt-1.5 font-medium leading-snug">“{evidence}”</p>

      <div className="mt-4">
        <ClassifyButtons picked={picked} onPick={(c) => setAnswer(id, { category: c })} size="sm" />
      </div>

      {picked && (
        <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex items-center gap-2">
            <CategoryBadge category={category} />
          </div>
          <p className="text-foreground/80">{reason}</p>
          {category === "depends" && (archNote || orgNote) && (
            <div className="grid gap-2 pt-1 text-xs sm:grid-cols-2">
              {archNote && (
                <p className="rounded-lg bg-arch-soft p-2 text-arch">
                  <strong>Arquitetura:</strong> {archNote}
                </p>
              )}
              {orgNote && (
                <p className="rounded-lg bg-org-soft p-2 text-org">
                  <strong>Organização:</strong> {orgNote}
                </p>
              )}
            </div>
          )}
          <p className="pt-1 text-[11px] text-muted-foreground">Fonte: {source}</p>
        </div>
      )}
    </div>
  )
}
