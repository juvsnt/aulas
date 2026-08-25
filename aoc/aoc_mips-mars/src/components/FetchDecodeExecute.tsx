import { useEffect, useState } from 'react'
import clsx from 'clsx'

const STAGES = [
  { label: 'Busca (Fetch)', detail: 'A CPU lê, na RAM, a instrução apontada por EIP/PC e a traz para dentro do processador.' },
  { label: 'Decodificação', detail: 'A unidade de controle interpreta os bits da instrução: qual operação, quais registradores, qual formato.' },
  { label: 'Execução', detail: 'A ALU realiza o cálculo (ou a unidade de memória realiza o acesso à RAM, em load/store).' },
  { label: 'Escrita do resultado', detail: 'O resultado é gravado de volta em um registrador (ou, às vezes, na memória) e o contador de instrução avança.' },
]

export default function FetchDecodeExecute({ autoplay = true }: { autoplay?: boolean }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => setActive((a) => (a + 1) % STAGES.length), 1800)
    return () => clearInterval(id)
  }, [autoplay])

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STAGES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            className={clsx(
              'rounded-lg border px-3 py-3 text-left text-xs font-semibold transition-all',
              active === i ? 'border-unemat-600 bg-unemat-700 text-white shadow-md' : 'border-unemat-200 bg-white text-unemat-700 hover:bg-unemat-50',
            )}
          >
            <span className={clsx('mb-1 block text-[10px] font-bold', active === i ? 'text-unemat-100' : 'text-unemat-400')}>
              {i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>
      <p key={active} className="mt-3 animate-[fadeIn_0.25s_ease] text-sm leading-relaxed text-gray-700">
        {STAGES[active].detail}
      </p>
    </div>
  )
}
