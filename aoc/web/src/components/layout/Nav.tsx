import { useState } from "react"
import { Cpu, Menu } from "lucide-react"
import { NAV_ITEMS } from "@/data/sections"
import { useLessonProgress } from "@/context/LessonProgressContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { PresentationModeToggle } from "./PresentationModeToggle"

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { activeId, goToSection } = useLessonProgress()
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            goToSection(item.id)
            onNavigate?.()
          }}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary",
            activeId === item.id
              ? "bg-secondary text-foreground"
              : "text-muted-foreground"
          )}
          aria-current={activeId === item.id ? "true" : undefined}
        >
          {item.label}
        </button>
      ))}
    </>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const { goToSection } = useLessonProgress()

  return (
    <header
      data-hide-in-presentation="true"
      className="fixed inset-x-0 top-1 z-40 flex justify-center px-4"
    >
      <div className="flex w-full max-w-6xl items-center justify-between gap-3 rounded-xl border border-border bg-card/90 px-4 py-2 shadow-sm backdrop-blur">
        <button
          onClick={() => goToSection("hero")}
          className="flex items-center gap-2 font-display text-sm font-semibold"
        >
          <Cpu className="size-4 text-arch" aria-hidden />
          <span className="hidden sm:inline">Arquitetura × Organização</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Seções da aula">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <PresentationModeToggle />
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Navegar pela aula</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1" aria-label="Seções da aula (mobile)">
                <NavLinks onNavigate={() => setOpen(false)} />
              </nav>
              <div className="mt-auto">
                <PresentationModeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
