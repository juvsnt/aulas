import clsx from 'clsx'
import { hex, type Memory, type MemAccess } from '../engine/common'

interface LabelInfo {
  address: number
  size: number
  count?: number
}

interface Props {
  memory: Memory
  dataLabels: Record<string, LabelInfo>
  lastAccess?: MemAccess[]
}

interface Row {
  address: number
  label: string
  value: number
}

export default function MemoryPanel({ memory, dataLabels, lastAccess = [] }: Props) {
  const rows: Row[] = []
  const seen = new Set<number>()

  for (const [name, info] of Object.entries(dataLabels)) {
    const words = Math.max(1, Math.floor(info.size / 4))
    for (let i = 0; i < words; i++) {
      const addr = info.address + i * 4
      rows.push({ address: addr, label: words > 1 ? `${name}[${i}]` : name, value: memory.readWord(addr) })
      seen.add(addr)
    }
  }
  for (const acc of lastAccess) {
    if (!seen.has(acc.address)) {
      rows.push({ address: acc.address, label: acc.label ?? '(pilha / endereço calculado)', value: memory.readWord(acc.address) })
      seen.add(acc.address)
    }
  }

  rows.sort((a, b) => a.address - b.address)
  const accessedNow = new Map(lastAccess.map((a) => [a.address, a.kind]))

  if (rows.length === 0) {
    return <p className="text-xs italic text-gray-400">Este exemplo não acessa a memória RAM — todos os dados ficam em registradores.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-unemat-100">
      <table className="w-full text-left font-mono-code text-xs">
        <thead className="bg-unemat-50 text-unemat-700">
          <tr>
            <th className="px-2 py-1.5 font-semibold">Endereço</th>
            <th className="px-2 py-1.5 font-semibold">Rótulo</th>
            <th className="px-2 py-1.5 font-semibold">Valor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const kind = accessedNow.get(r.address)
            return (
              <tr
                key={r.address}
                className={clsx(
                  'border-t border-unemat-50 transition-colors duration-300',
                  kind === 'write' ? 'bg-blue-50' : kind === 'read' ? 'bg-blue-50/50' : undefined,
                )}
              >
                <td className="px-2 py-1 text-gray-500">{hex(r.address)}</td>
                <td className={clsx('px-2 py-1', kind ? 'font-semibold text-accent-mem' : 'text-gray-700')}>{r.label}</td>
                <td className="px-2 py-1 text-gray-800">{r.value}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
