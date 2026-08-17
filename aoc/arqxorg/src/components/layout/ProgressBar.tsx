import { useLessonProgress } from "@/context/LessonProgressContext"

export function ProgressBar() {
  const { progressPercent } = useLessonProgress()
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent"
      role="progressbar"
      aria-label="Progresso da aula"
      aria-valuenow={progressPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-arch via-org to-depends transition-[width] duration-300 ease-out"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  )
}
