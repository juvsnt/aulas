import clsx from 'clsx'
import { hex } from '../engine/common'

interface Props {
  order: string[]
  registers: Record<string, number>
  readSet?: string[]
  writtenSet?: string[]
  /** registradores usados pelo exemplo atual (para dar destaque visual mesmo sem leitura/escrita neste passo) */
  relevant?: Set<string>
  dense?: boolean
  base?: 10 | 16
}

export default function RegisterGrid({ order, registers, readSet = [], writtenSet = [], relevant, dense, base = 16 }: Props) {
  const readS = new Set(readSet)
  const writtenS = new Set(writtenSet)
  return (
    <div className={clsx('grid gap-1.5', dense ? 'grid-cols-4 sm:grid-cols-8' : 'grid-cols-2 sm:grid-cols-4')}>
      {order.map((name) => {
        const isRead = readS.has(name)
        const isWritten = writtenS.has(name)
        const isRelevant = relevant?.has(name)
        const value = registers[name] ?? 0
        return (
          <div
            key={name}
            className={clsx(
              'rounded-md border px-2 py-1.5 font-mono-code transition-all duration-300',
              dense ? 'text-[11px]' : 'text-xs',
              isWritten
                ? 'border-accent-reg bg-amber-50 shadow-[0_0_0_2px_rgba(180,83,9,0.15)] animate-pulse-glow'
                : isRead
                  ? 'border-unemat-400 bg-unemat-50'
                  : isRelevant
                    ? 'border-unemat-200 bg-white'
                    : 'border-gray-100 bg-gray-50/60',
            )}
            title={name}
          >
            <div className={clsx('font-semibold', isWritten ? 'text-accent-reg' : isRead ? 'text-unemat-700' : 'text-gray-500')}>
              {name}
            </div>
            <div className="text-gray-800">{base === 16 ? hex(value, dense ? 8 : 8) : value}</div>
          </div>
        )
      })}
    </div>
  )
}
