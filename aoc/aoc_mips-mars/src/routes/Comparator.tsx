import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { MICRO_EXAMPLES } from '../data/examples'
import { QUIZZES } from '../data/quizzes'
import { PageHeader, Section, Callout, ModuleFooterNav } from '../components/PageChrome'
import ExampleWalkthrough from '../components/ExampleWalkthrough'
import Quiz from '../components/Quiz'
import { ia32Adapter, mipsAdapter } from '../engine/runner'

export default function Comparator() {
  const [selectedId, setSelectedId] = useState(MICRO_EXAMPLES[2].id) // "soma" por padrão
  const example = MICRO_EXAMPLES.find((e) => e.id === selectedId) ?? MICRO_EXAMPLES[0]
  const quiz = QUIZZES[selectedId]

  const counts = useMemo(() => {
    try {
      const ia32n = ia32Adapter.instructionCount(ia32Adapter.assemble(example.ia32.asm))
      const mipsn = mipsAdapter.instructionCount(mipsAdapter.assemble(example.mips.asm))
      return { ia32: ia32n, mips: mipsn }
    } catch {
      return { ia32: 0, mips: 0 }
    }
  }, [example])

  return (
    <div>
      <PageHeader
        kicker="Módulo 7"
        title="IA-32 × MIPS, lado a lado"
        subtitle={`c = a + b; — selecione uma construção C e avance instrução por instrução nas duas ISAs, observando registradores e memória em paralelo.`}
      />

      <Section>
        <div className="flex flex-wrap gap-2">
          {MICRO_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedId(ex.id)}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                selectedId === ex.id ? 'border-unemat-600 bg-unemat-700 text-white' : 'border-unemat-200 bg-white text-unemat-700 hover:bg-unemat-50',
              )}
            >
              {ex.title}
            </button>
          ))}
        </div>
      </Section>

      <Section>
        <Callout>
          <strong>{example.cCode.split('\n')[0]}</strong> {example.cCode.split('\n').length > 1 && '(…)'} — IA-32
          precisou de <strong>{counts.ia32}</strong> instrução(ões); MIPS precisou de <strong>{counts.mips}</strong>.{' '}
          {example.guidingQuestion}
        </Callout>
      </Section>

      <Section title="IA-32">
        <ExampleWalkthrough example={example} isa="ia32" />
      </Section>

      <Section title="MIPS">
        <ExampleWalkthrough example={example} isa="mips" />
      </Section>

      {quiz && (
        <Section title="Confira o que você observou">
          <Quiz questions={quiz} />
        </Section>
      )}

      <ModuleFooterNav />
    </div>
  )
}
