import { useState } from 'react'
import clsx from 'clsx'
import { MICRO_EXAMPLES } from '../data/examples'
import type { IsaId } from '../engine/runner'
import { PageHeader, Section, Callout, ModuleFooterNav } from './PageChrome'
import ExampleWalkthrough from './ExampleWalkthrough'

export default function ExamplesListPage({
  isa,
  kicker,
  title,
  subtitle,
}: {
  isa: IsaId
  kicker: string
  title: string
  subtitle: string
}) {
  const [selectedId, setSelectedId] = useState(MICRO_EXAMPLES[0].id)
  const example = MICRO_EXAMPLES.find((e) => e.id === selectedId) ?? MICRO_EXAMPLES[0]

  return (
    <div>
      <PageHeader kicker={kicker} title={title} subtitle={subtitle} />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {MICRO_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedId(ex.id)}
              className={clsx(
                'shrink-0 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors lg:shrink',
                selectedId === ex.id
                  ? 'border-unemat-600 bg-unemat-700 text-white'
                  : 'border-unemat-100 bg-white text-unemat-700 hover:bg-unemat-50',
              )}
            >
              {ex.title}
            </button>
          ))}
        </nav>

        <div key={example.id} className="animate-[fadeIn_0.2s_ease]">
          <Section title={example.title}>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-unemat-100 bg-[#0b1f14] p-3">
                <div className="mb-1.5 text-[11px] font-medium tracking-wide text-unemat-200">Código C</div>
                <pre className="font-mono-code text-[12.5px] leading-relaxed text-gray-100">{example.cCode}</pre>
              </div>
              <div className="rounded-lg border border-unemat-100 bg-unemat-50/60 p-3 text-xs leading-relaxed text-gray-700">
                {example.concept}
              </div>
            </div>
            <Callout tone="question">{example.guidingQuestion}</Callout>
            <div className="mt-4">
              <ExampleWalkthrough example={example} isa={isa} />
            </div>
          </Section>
        </div>
      </div>

      <ModuleFooterNav />
    </div>
  )
}
