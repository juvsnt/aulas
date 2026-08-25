import { useMemo, useState } from 'react'
import { MIPS_OPS } from '../engine/mips'
import { MIPS_REGISTER_INFO } from '../engine/mipsRegisters'

const R_TYPE_OPS = ['add', 'sub', 'and', 'or', 'slt'] as const

function bin(n: number, width: number): string {
  return (n >>> 0).toString(2).padStart(width, '0').slice(-width)
}

export default function RFormatEncoder() {
  const [op, setOp] = useState<(typeof R_TYPE_OPS)[number]>('add')
  const [rs, setRs] = useState('$s0')
  const [rt, setRt] = useState('$s1')
  const [rd, setRd] = useState('$t0')

  const regNum = (name: string) => MIPS_REGISTER_INFO.find((r) => r.name === name)?.number ?? 0
  const regBin = (name: string) => MIPS_REGISTER_INFO.find((r) => r.name === name)?.binary ?? '00000'

  const info = MIPS_OPS[op]
  const fields = useMemo(
    () => ({
      opcode: { dec: 0, bin: bin(0, 6) },
      rs: { dec: regNum(rs), bin: regBin(rs) },
      rt: { dec: regNum(rt), bin: regBin(rt) },
      rd: { dec: regNum(rd), bin: regBin(rd) },
      shamt: { dec: 0, bin: bin(0, 5) },
      funct: { dec: info.funct ?? 0, bin: bin(info.funct ?? 0, 6) },
    }),
    [op, rs, rt, rd, info],
  )

  const fullBinary = fields.opcode.bin + fields.rs.bin + fields.rt.bin + fields.rd.bin + fields.shamt.bin + fields.funct.bin
  const hex = '0x' + BigInt('0b' + fullBinary).toString(16).padStart(8, '0')

  const RegSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <label className="text-xs">
      <span className="mb-1 block font-semibold text-unemat-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-unemat-200 bg-white px-2 py-1.5 font-mono-code text-xs"
      >
        {MIPS_REGISTER_INFO.map((r) => (
          <option key={r.name} value={r.name}>
            {r.name} (${r.number})
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="rounded-xl border border-unemat-100 bg-white p-4">
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-unemat-700">instrução</span>
          <select
            value={op}
            onChange={(e) => setOp(e.target.value as (typeof R_TYPE_OPS)[number])}
            className="w-full rounded-md border border-unemat-200 bg-white px-2 py-1.5 font-mono-code text-xs uppercase"
          >
            {R_TYPE_OPS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <RegSelect value={rd} onChange={setRd} label="rd (destino)" />
        <RegSelect value={rs} onChange={setRs} label="rs (fonte 1)" />
        <RegSelect value={rt} onChange={setRt} label="rt (fonte 2)" />
      </div>

      <div className="mb-3 rounded-md bg-[#0b1f14] px-3 py-2 font-mono-code text-sm text-unemat-100">
        {op.toUpperCase()} {rd}, {rs}, {rt}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-center text-xs">
          <thead>
            <tr className="text-unemat-600">
              <th className="p-1.5">op</th>
              <th className="p-1.5">rs</th>
              <th className="p-1.5">rt</th>
              <th className="p-1.5">rd</th>
              <th className="p-1.5">shamt</th>
              <th className="p-1.5">funct</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-mono-code text-gray-500">
              <td>6 bits</td>
              <td>5 bits</td>
              <td>5 bits</td>
              <td>5 bits</td>
              <td>5 bits</td>
              <td>6 bits</td>
            </tr>
            <tr className="font-mono-code font-semibold text-unemat-800">
              <td>{fields.opcode.dec}</td>
              <td>{fields.rs.dec}</td>
              <td>{fields.rt.dec}</td>
              <td>{fields.rd.dec}</td>
              <td>{fields.shamt.dec}</td>
              <td>{fields.funct.dec}</td>
            </tr>
            <tr className="border-t border-unemat-100 bg-unemat-50 font-mono-code text-unemat-700">
              <td className="p-1.5">{fields.opcode.bin}</td>
              <td className="p-1.5">{fields.rs.bin}</td>
              <td className="p-1.5">{fields.rt.bin}</td>
              <td className="p-1.5">{fields.rd.bin}</td>
              <td className="p-1.5">{fields.shamt.bin}</td>
              <td className="p-1.5">{fields.funct.bin}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-1 text-center">
        <div className="font-mono-code text-sm tracking-widest text-unemat-800">{fullBinary}</div>
        <div className="font-mono-code text-xs text-gray-500">{hex}</div>
      </div>
    </div>
  )
}
