import { useState } from "react"
import type { Hotspot } from "@/data/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CategoryBadge, ClassifyButtons } from "@/components/lesson/category"
import { useLessonProgress } from "@/context/LessonProgressContext"
import { cn } from "@/lib/utils"
import type { Category } from "@/data/types"

const dotClass: Record<Category, string> = {
  architecture: "bg-arch",
  organization: "bg-org",
  depends: "bg-depends",
}

export function HardwareHotspot({ hotspot }: { hotspot: Hotspot }) {
  const { answers, setAnswer } = useLessonProgress()
  const [open, setOpen] = useState(false)
  const picked = answers[hotspot.id]?.category ?? null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white/70 shadow-md transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/60",
            "size-5 sm:size-4",
            picked ? dotClass[picked] : "bg-primary animate-pulse"
          )}
          aria-label={`Explorar: ${hotspot.label}`}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[min(22rem,90vw)]">
        <p className="font-display text-base font-semibold">{hotspot.label}</p>
        <p className="mt-2 text-sm text-foreground/90">{hotspot.question}</p>

        <div className="mt-4">
          <ClassifyButtons
            picked={picked}
            onPick={(c) => setAnswer(hotspot.id, { category: c })}
            size="sm"
          />
        </div>

        {picked && (
          <div className="mt-4 space-y-2 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Como pensar sobre isso:</span>
              <CategoryBadge category={hotspot.category} />
            </div>
            <p className="text-sm text-foreground/80">{hotspot.explanation}</p>
            {hotspot.category === "depends" && (
              <div className="grid gap-2 pt-1 text-xs sm:grid-cols-2">
                {hotspot.archNote && (
                  <p className="rounded-lg bg-arch-soft p-2 text-arch">
                    <strong>Arquitetura:</strong> {hotspot.archNote}
                  </p>
                )}
                {hotspot.orgNote && (
                  <p className="rounded-lg bg-org-soft p-2 text-org">
                    <strong>Organização:</strong> {hotspot.orgNote}
                  </p>
                )}
              </div>
            )}
            <p className="pt-1 text-[11px] text-muted-foreground">Fonte: {hotspot.source}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
