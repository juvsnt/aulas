import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useLessonProgress } from "./LessonProgressContext"

interface PresentationModeValue {
  isPresentationMode: boolean
  toggle: () => void
}

const PresentationModeContext = createContext<PresentationModeValue | null>(null)

export function PresentationModeProvider({ children }: { children: React.ReactNode }) {
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const { goRelative, goToSection } = useLessonProgress()

  useEffect(() => {
    document.body.classList.toggle("presentation-mode", isPresentationMode)
  }, [isPresentationMode])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      if (isTyping) return

      if (e.key === "Escape" && isPresentationMode) {
        setIsPresentationMode(false)
        return
      }
      if (!isPresentationMode) return

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
        case " ":
          e.preventDefault()
          goRelative(1)
          break
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault()
          goRelative(-1)
          break
        case "Home":
          e.preventDefault()
          goToSection("hero")
          break
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isPresentationMode, goRelative, goToSection])

  const value: PresentationModeValue = {
    isPresentationMode,
    toggle: () => setIsPresentationMode((v) => !v),
  }

  return (
    <PresentationModeContext.Provider value={value}>{children}</PresentationModeContext.Provider>
  )
}

export function usePresentationMode() {
  const ctx = useContext(PresentationModeContext)
  if (!ctx) throw new Error("usePresentationMode deve ser usado dentro de PresentationModeProvider")
  return ctx
}
