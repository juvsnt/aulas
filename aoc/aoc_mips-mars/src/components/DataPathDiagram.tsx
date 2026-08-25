import clsx from 'clsx'
import type { StepEvent } from '../engine/common'

interface Props {
  event: StepEvent | null
  /** chave única para forçar o replay da animação a cada passo */
  tick: number
  compact?: boolean
}

/**
 * Visualização RAM ↔ CPU ↔ Registradores ↔ ALU.
 * A cada passo de execução, anima o caminho realmente percorrido pelos
 * dados: barramento RAM↔CPU quando há acesso à memória, e o caminho
 * Registradores↔ALU quando há operação aritmética/lógica.
 */
export default function DataPathDiagram({ event, tick, compact }: Props) {
  const memReads = event?.memory.filter((m) => m.kind === 'read').length ?? 0
  const memWrites = event?.memory.filter((m) => m.kind === 'write').length ?? 0
  const memActive = memReads > 0 || memWrites > 0
  const aluActive = event?.aluInvolved ?? false
  const regsTouched = (event?.registersRead.length ?? 0) + (event?.registersWritten.length ?? 0) > 0

  const h = compact ? 150 : 190

  return (
    <div className="rounded-xl border border-unemat-100 bg-gradient-to-b from-unemat-50/60 to-white p-3">
      <svg viewBox={`0 0 480 ${h}`} className="w-full" role="img" aria-label="Diagrama RAM, CPU, Registradores e ALU">
        {/* RAM */}
        <g>
          <rect x={10} y={h / 2 - 45} width={110} height={90} rx={10} className={clsx('stroke-2', memActive ? 'fill-blue-50 stroke-accent-mem' : 'fill-gray-50 stroke-gray-300')} />
          <text x={65} y={h / 2 - 20} textAnchor="middle" className="fill-gray-700 text-[13px] font-semibold">RAM</text>
          <text x={65} y={h / 2 + 2} textAnchor="middle" className="fill-gray-500 text-[9px]">memória principal</text>
          {memReads > 0 && <text x={65} y={h / 2 + 24} textAnchor="middle" className="fill-accent-mem text-[9px] font-semibold">lendo…</text>}
          {memWrites > 0 && <text x={65} y={h / 2 + 24} textAnchor="middle" className="fill-accent-mem text-[9px] font-semibold">gravando…</text>}
        </g>

        {/* barramento RAM <-> CPU */}
        <line x1={120} y1={h / 2} x2={190} y2={h / 2} className={clsx('stroke-2', memActive ? 'stroke-accent-mem' : 'stroke-gray-300')} />
        {memActive && (
          <circle r={4} className="fill-accent-mem">
            <animateMotion
              key={`mem-${tick}`}
              dur="0.9s"
              repeatCount="1"
              path={memWrites > 0 ? 'M190,0 L120,0' : 'M120,0 L190,0'}
              keyPoints={memWrites > 0 ? '0;1' : '0;1'}
              keyTimes="0;1"
              additive="sum"
              transform={`translate(0 ${h / 2})`}
            />
          </circle>
        )}

        {/* CPU boundary */}
        <rect x={190} y={16} width={280} height={h - 32} rx={12} className="fill-unemat-50/40 stroke-unemat-300 stroke-2" strokeDasharray="6 4" />
        <text x={330} y={32} textAnchor="middle" className="fill-unemat-700 text-[11px] font-bold tracking-wide">CPU</text>

        {/* Registradores */}
        <rect x={210} y={h / 2 - 45} width={110} height={90} rx={10} className={clsx('stroke-2', regsTouched ? 'fill-amber-50 stroke-accent-reg' : 'fill-white stroke-gray-300')} />
        <text x={265} y={h / 2 - 20} textAnchor="middle" className="fill-gray-700 text-[13px] font-semibold">Registradores</text>
        {event && event.registersRead.length > 0 && (
          <text x={265} y={h / 2 + 2} textAnchor="middle" className="fill-accent-reg text-[9px]">lê: {event.registersRead.slice(0, 3).join(', ')}</text>
        )}
        {event && event.registersWritten.length > 0 && (
          <text x={265} y={h / 2 + 24} textAnchor="middle" className="fill-accent-reg text-[9px] font-semibold">escreve: {event.registersWritten.slice(0, 3).join(', ')}</text>
        )}

        {/* caminho Registradores <-> ALU */}
        <line x1={320} y1={h / 2} x2={380} y2={h / 2} className={clsx('stroke-2', aluActive ? 'stroke-accent-alu' : 'stroke-gray-300')} />
        {aluActive && (
          <circle r={4} className="fill-accent-alu">
            <animateMotion key={`alu-${tick}`} dur="0.8s" repeatCount="1" path="M0,0 L60,0" transform={`translate(320 ${h / 2})`} />
          </circle>
        )}

        {/* ALU */}
        <polygon
          points={`390,${h / 2 - 40} 460,${h / 2 - 25} 460,${h / 2 + 25} 390,${h / 2 + 40} 400,${h / 2}`}
          className={clsx('stroke-2', aluActive ? 'fill-purple-50 stroke-accent-alu animate-pulse-glow' : 'fill-white stroke-gray-300')}
        />
        <text x={430} y={h / 2 + 4} textAnchor="middle" className="fill-gray-700 text-[12px] font-semibold">ALU</text>
      </svg>
      {event && (
        <p className="mt-1 text-center text-[11px] text-gray-500">
          {memActive ? 'Caminho ativo: RAM ↔ CPU. ' : ''}
          {aluActive ? 'Caminho ativo: Registradores ↔ ALU.' : !memActive ? 'Nenhum acesso à memória neste passo — tudo resolvido em registradores.' : ''}
        </p>
      )}
    </div>
  )
}
