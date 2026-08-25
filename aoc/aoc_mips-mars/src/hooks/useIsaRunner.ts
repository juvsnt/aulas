import { useMemo, useRef, useState } from 'react'
import type { StepEvent } from '../engine/common'
import type { IsaAdapter } from '../engine/runner'

export interface IsaRunner<TProgram, TState> {
  program: TProgram | null
  error: string | null
  history: TState[]
  events: (StepEvent | null)[]
  index: number
  current: TState | null
  lastEvent: StepEvent | null
  canStepForward: boolean
  canStepBack: boolean
  stepForward: () => void
  stepBack: () => void
  reset: () => void
  runToEnd: () => void
  goTo: (i: number) => void
}

const MAX_AUTO_STEPS = 500

export function useIsaRunner<TProgram, TState>(
  source: string,
  adapter: IsaAdapter<TProgram, TState>,
): IsaRunner<TProgram, TState> {
  const [program, error] = useMemo<[TProgram | null, string | null]>(() => {
    try {
      return [adapter.assemble(source), null]
    } catch (e) {
      return [null, (e as Error).message]
    }
  }, [source, adapter])

  const initial = useMemo(() => (program ? adapter.createInitial(program) : null), [program, adapter])

  const [history, setHistory] = useState<TState[]>(initial ? [initial] : [])
  const [events, setEvents] = useState<(StepEvent | null)[]>([null])
  const [index, setIndex] = useState(0)

  const lastSourceRef = useRef(source)
  if (lastSourceRef.current !== source) {
    lastSourceRef.current = source
    if (initial) {
      setHistory([initial])
      setEvents([null])
      setIndex(0)
    }
  }

  const current = history[index] ?? null
  const lastEvent = events[index] ?? null
  const atTip = index === history.length - 1
  const halted = current ? adapter.isHalted(current) : true
  const canStepForward = !!program && !!current && atTip && !halted
  const canStepBack = index > 0

  function stepForward() {
    if (!program) return
    if (!atTip) {
      setIndex((i) => i + 1)
      return
    }
    if (!current || adapter.isHalted(current)) return
    const { state: next, event } = adapter.step(current, program)
    setHistory((h) => [...h, next])
    setEvents((e) => [...e, event])
    setIndex((i) => i + 1)
  }

  function stepBack() {
    setIndex((i) => Math.max(0, i - 1))
  }

  function goTo(i: number) {
    setIndex(Math.max(0, Math.min(i, history.length - 1)))
  }

  function reset() {
    if (!initial) return
    setHistory([initial])
    setEvents([null])
    setIndex(0)
  }

  function runToEnd() {
    if (!program || !current) return
    let st = history[history.length - 1]
    const newHistory: TState[] = []
    const newEvents: (StepEvent | null)[] = []
    let guard = 0
    while (!adapter.isHalted(st) && guard++ < MAX_AUTO_STEPS) {
      const { state: next, event } = adapter.step(st, program)
      newHistory.push(next)
      newEvents.push(event)
      st = next
    }
    setHistory((h) => [...h, ...newHistory])
    setEvents((e) => [...e, ...newEvents])
    setIndex((i) => i + newHistory.length)
  }

  return {
    program,
    error,
    history,
    events,
    index,
    current,
    lastEvent,
    canStepForward,
    canStepBack,
    stepForward,
    stepBack,
    reset,
    runToEnd,
    goTo,
  }
}
