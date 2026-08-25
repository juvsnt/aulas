import { useMemo } from 'react'
import type { MicroExample } from '../data/examples'
import { useIsaRunner } from '../hooks/useIsaRunner'
import { adapterFor, type IsaId } from '../engine/runner'
import CodePane from './CodePane'
import RegisterGrid from './RegisterGrid'
import FlagsRow from './FlagsRow'
import MemoryPanel from './MemoryPanel'
import StepperControls from './StepperControls'
import DataPathDiagram from './DataPathDiagram'

function extractRelevantRegisters(variableMap: Record<string, string>): Set<string> {
  const set = new Set<string>()
  const re = /\$[a-z]+\d*|\bE[A-Z]{2}\b/g
  for (const v of Object.values(variableMap)) {
    const matches = v.match(re)
    matches?.forEach((m) => set.add(m))
  }
  return set
}

export default function ExampleWalkthrough({ example, isa }: { example: MicroExample; isa: IsaId }) {
  const adapter = adapterFor(isa)
  const source = isa === 'ia32' ? example.ia32.asm : example.mips.asm
  const variableMap = isa === 'ia32' ? example.ia32.variableMap : example.mips.variableMap
  const runner = useIsaRunner(source, adapter)
  const relevant = useMemo(() => extractRelevantRegisters(variableMap), [variableMap])

  if (runner.error || !runner.program || !runner.current) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Erro ao montar o programa {isa.toUpperCase()}: {runner.error}
      </div>
    )
  }

  const pc = adapter.getPc(runner.current)
  const activeLine = adapter.getSourceLine(runner.program, pc)
  const registers = adapter.getRegisters(runner.current)
  const flags = adapter.getFlags(runner.current)
  const memory = adapter.getMemory(runner.current)
  const dataLabels = adapter.getDataLabels(runner.program)
  const output = adapter.getOutput(runner.current)
  const halted = adapter.isHalted(runner.current)
  const totalInstr = adapter.instructionCount(runner.program)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <CodePane source={source} activeLine={halted ? undefined : activeLine} title={adapter.label} />
        <StepperControls
          onBack={runner.stepBack}
          onForward={runner.stepForward}
          onReset={runner.reset}
          onRunToEnd={runner.runToEnd}
          canBack={runner.canStepBack}
          canForward={runner.canStepForward}
          stepLabel={halted ? `encerrado · ${runner.index} passo(s)` : `instrução ${Math.min(pc + 1, totalInstr)} de ${totalInstr}`}
        />
        {runner.lastEvent && runner.lastEvent.asmText && (
          <div className="rounded-lg border border-unemat-100 bg-unemat-50/60 p-3 text-xs leading-relaxed text-unemat-800">
            <span className="font-mono-code font-semibold text-unemat-700">{runner.lastEvent.asmText.trim()}</span>
            <p className="mt-1">{runner.lastEvent.explanation}</p>
          </div>
        )}
        {output.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-900 p-2 font-mono-code text-xs text-green-300">
            {output.map((l, i) => (
              <div key={i}>&gt; {l}</div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <DataPathDiagram event={runner.lastEvent} tick={runner.index} compact />
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-unemat-600">Registradores</h4>
          <RegisterGrid
            order={adapter.registerOrder}
            registers={registers}
            readSet={runner.lastEvent?.registersRead}
            writtenSet={runner.lastEvent?.registersWritten}
            relevant={relevant}
            dense={isa === 'mips'}
          />
        </div>
        {flags && (
          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-unemat-600">Flags</h4>
            <FlagsRow flags={flags} writtenFlags={runner.lastEvent?.flagsWritten} />
          </div>
        )}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-unemat-600">Memória RAM</h4>
          <MemoryPanel memory={memory} dataLabels={dataLabels} lastAccess={runner.lastEvent?.memory} />
        </div>
      </div>
    </div>
  )
}
