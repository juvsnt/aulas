import clsx from 'clsx'
import { Fragment } from 'react'

interface Props {
  source: string
  /** número da linha (1-based) da instrução atualmente destacada */
  activeLine?: number
  title?: string
}

const MNEMONICS = new Set(
  `mov lea add sub cmp inc dec neg and or xor imul push pop call ret jmp je jz jne jnz jg jnle jge jnl jl jnge jle jng nop
   add addu addi addiu sub subu and andi or ori xor xori nor slt sltu sll srl sra jr mult multu div divu mfhi mflo
   lw sw lb sb lui beq bne j jal li la move b blt ble bgt bge mul neg2 not syscall`
    .trim()
    .split(/\s+/),
)

function highlightToken(tok: string, key: number) {
  if (/^[a-zA-Z_][\w]*:$/.test(tok)) return <span key={key} className="text-unemat-700 font-semibold">{tok}</span>
  if (tok.startsWith('$') || /^E[A-Z]{2}$/.test(tok)) return <span key={key} className="text-accent-reg">{tok}</span>
  if (MNEMONICS.has(tok.toLowerCase())) return <span key={key} className="text-accent-alu font-semibold">{tok}</span>
  if (/^-?(0x[0-9a-fA-F]+|\d+)$/.test(tok)) return <span key={key} className="text-accent-mem">{tok}</span>
  if (tok.startsWith('.')) return <span key={key} className="text-unemat-500">{tok}</span>
  return <Fragment key={key}>{tok}</Fragment>
}

function highlightLine(line: string) {
  const commentIdx = Math.min(
    ...['#', ';'].map((c) => (line.includes(c) ? line.indexOf(c) : Infinity)),
  )
  const code = Number.isFinite(commentIdx) ? line.slice(0, commentIdx) : line
  const comment = Number.isFinite(commentIdx) ? line.slice(commentIdx) : ''
  const parts = code.split(/([ \t,()[\]]+)/).filter((p) => p.length > 0)
  return (
    <>
      {parts.map((p, i) => (/[ \t,()[\]]+/.test(p) ? <Fragment key={i}>{p}</Fragment> : highlightToken(p, i)))}
      {comment && <span className="text-gray-400 italic">{comment}</span>}
    </>
  )
}

export default function CodePane({ source, activeLine, title }: Props) {
  const lines = source.split('\n')
  return (
    <div className="overflow-hidden rounded-lg border border-unemat-100 bg-[#0b1f14]">
      {title && (
        <div className="border-b border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium tracking-wide text-unemat-200">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto p-0 text-[12.5px] leading-relaxed">
        <code className="font-mono-code">
          {lines.map((line, i) => {
            const lineNo = i + 1
            const active = lineNo === activeLine
            return (
              <div
                key={i}
                className={clsx(
                  'flex px-2 transition-colors duration-300',
                  active && 'bg-unemat-500/25 shadow-[inset_3px_0_0_0_var(--color-unemat-400)]',
                )}
              >
                <span className="mr-3 w-6 shrink-0 select-none text-right text-gray-500">{line.trim() ? lineNo : ''}</span>
                <span className="whitespace-pre text-gray-100">{line.trim() ? highlightLine(line) : ' '}</span>
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}
