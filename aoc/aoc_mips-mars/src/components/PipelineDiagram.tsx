import { useState } from 'react'
import clsx from 'clsx'

interface Stage {
  label: string
  short: string
  detail: string
  example: string
}

const STAGES: Stage[] = [
  {
    label: 'Linguagem de alto nível (C)',
    short: 'C',
    detail:
      'Código legível por humanos, independente do processador. O mesmo trecho em C pode ser compilado para processadores completamente diferentes — nada aqui é "físico" ainda.',
    example: 'c = a + b;',
  },
  {
    label: 'Compilador',
    short: 'compilador',
    detail:
      'Traduz o C para instruções pertencentes a uma ISA específica (IA-32, MIPS, ARM...). É aqui que a escolha de arquitetura-alvo entra em jogo — o mesmo C gera Assembly diferente para cada ISA.',
    example: 'gcc -S / mips-gcc -S',
  },
  {
    label: 'Assembly',
    short: 'Assembly',
    detail:
      'Representação textual, legível, das instruções da ISA — um mnemônico para cada operação. Assembly não é o que o processador executa; é uma notação para humanos lerem a ISA.',
    example: 'ADD $t0, $s0, $s1',
  },
  {
    label: 'ISA (Arquitetura do Conjunto de Instruções)',
    short: 'ISA',
    detail:
      'O contrato formal entre software e hardware: quais instruções existem, quais registradores, que formatos de codificação. A ISA é uma especificação — não um circuito.',
    example: 'opcode=0, funct=32 (ADD)',
  },
  {
    label: 'Linguagem de máquina',
    short: 'máquina',
    detail:
      'A codificação binária das instruções da ISA — o que efetivamente entra no processador, ciclo a ciclo, pela unidade de busca de instruções.',
    example: '000000 10000 10001 01000 00000 100000',
  },
  {
    label: 'Microarquitetura / hardware',
    short: 'hardware',
    detail:
      'A implementação física real: ALU, registradores como circuitos, caminhos de dados, pipeline. Duas CPUs (ex.: Pentium 4 e um Core i7) podem implementar a MESMA ISA com organizações internas bem diferentes.',
    example: 'transistores, ALU, barramentos',
  },
]

export default function PipelineDiagram() {
  const [selected, setSelected] = useState(0)
  return (
    <div>
      <div className="flex flex-wrap items-stretch gap-1.5">
        {STAGES.map((s, i) => (
          <div key={s.short} className="flex items-center gap-1.5">
            <button
              onClick={() => setSelected(i)}
              className={clsx(
                'rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-all sm:text-sm',
                selected === i
                  ? 'border-unemat-600 bg-unemat-700 text-white shadow-md scale-[1.03]'
                  : 'border-unemat-200 bg-white text-unemat-700 hover:border-unemat-400 hover:bg-unemat-50',
              )}
            >
              {s.label}
            </button>
            {i < STAGES.length - 1 && <span className="text-unemat-300">→</span>}
          </div>
        ))}
      </div>

      <div key={selected} className="mt-5 animate-[fadeIn_0.25s_ease] rounded-xl border border-unemat-100 bg-unemat-50/50 p-4 sm:p-5">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-unemat-500">{STAGES[selected].label}</div>
        <p className="text-sm leading-relaxed text-gray-700">{STAGES[selected].detail}</p>
        <div className="mt-3 inline-block rounded-md bg-[#0b1f14] px-3 py-1.5 font-mono-code text-xs text-unemat-100">
          {STAGES[selected].example}
        </div>
      </div>
    </div>
  )
}
