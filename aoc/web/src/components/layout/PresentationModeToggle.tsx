import { Presentation, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePresentationMode } from "@/context/PresentationModeContext"

export function PresentationModeToggle() {
  const { isPresentationMode, toggle } = usePresentationMode()
  return (
    <Button
      variant={isPresentationMode ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      aria-pressed={isPresentationMode}
      aria-label={
        isPresentationMode ? "Sair do modo apresentação (Esc)" : "Entrar no modo apresentação"
      }
    >
      {isPresentationMode ? <X /> : <Presentation />}
      <span className="hidden sm:inline">
        {isPresentationMode ? "Sair da apresentação" : "Modo apresentação"}
      </span>
    </Button>
  )
}
