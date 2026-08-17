import * as React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { SECTION_ORDER } from "@/data/sections"
import type { Category } from "@/data/types"

const STORAGE_KEY = "aoc-lesson-progress-v1"

export interface QuizAnswer {
  category: Category
  justification?: string
}

interface StoredState {
  visited: string[]
  answers: Record<string, QuizAnswer>
  lastSection: string
}

interface LessonProgressValue {
  activeId: string
  visited: Set<string>
  progressPercent: number
  answers: Record<string, QuizAnswer>
  setAnswer: (id: string, answer: QuizAnswer) => void
  goToSection: (id: string) => void
  goRelative: (delta: 1 | -1) => void
}

const LessonProgressContext = createContext<LessonProgressValue | null>(null)

function loadState(): StoredState {
  if (typeof window === "undefined") return { visited: [], answers: {}, lastSection: "hero" }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { visited: [], answers: {}, lastSection: "hero" }
    const parsed = JSON.parse(raw) as StoredState
    return {
      visited: parsed.visited ?? [],
      answers: parsed.answers ?? {},
      lastSection: parsed.lastSection ?? "hero",
    }
  } catch {
    return { visited: [], answers: {}, lastSection: "hero" }
  }
}

export function LessonProgressProvider({ children }: { children: React.ReactNode }) {
  const initial = useRef(loadState())
  const [activeId, setActiveId] = useState(initial.current.lastSection)
  const [visited, setVisited] = useState<Set<string>>(new Set(initial.current.visited))
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>(initial.current.answers)

  useEffect(() => {
    const ids = SECTION_ORDER.map((s) => s.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visibleEntry) {
          const id = visibleEntry.target.id
          setActiveId(id)
          setVisited((prev) => {
            if (prev.has(id)) return prev
            const next = new Set(prev)
            next.add(id)
            return next
          })
        }
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-15% 0px -15% 0px" }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const state: StoredState = {
      visited: Array.from(visited),
      answers,
      lastSection: activeId,
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage indisponivel (modo privado etc.) - segue sem persistir
    }
  }, [visited, answers, activeId])

  const setAnswer = useCallback((id: string, answer: QuizAnswer) => {
    setAnswers((prev) => ({ ...prev, [id]: answer }))
  }, [])

  const goToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const goRelative = useCallback(
    (delta: 1 | -1) => {
      const ids = SECTION_ORDER.map((s) => s.id)
      const idx = ids.indexOf(activeId)
      const nextIdx = Math.min(Math.max(idx + delta, 0), ids.length - 1)
      goToSection(ids[nextIdx])
    },
    [activeId, goToSection]
  )

  const progressPercent = useMemo(() => {
    const idx = SECTION_ORDER.findIndex((s) => s.id === activeId)
    if (idx < 0) return 0
    return Math.round(((idx + 1) / SECTION_ORDER.length) * 100)
  }, [activeId])

  const value = useMemo<LessonProgressValue>(
    () => ({ activeId, visited, progressPercent, answers, setAnswer, goToSection, goRelative }),
    [activeId, visited, progressPercent, answers, setAnswer, goToSection, goRelative]
  )

  return (
    <LessonProgressContext.Provider value={value}>{children}</LessonProgressContext.Provider>
  )
}

export function useLessonProgress() {
  const ctx = useContext(LessonProgressContext)
  if (!ctx) throw new Error("useLessonProgress deve ser usado dentro de LessonProgressProvider")
  return ctx
}
