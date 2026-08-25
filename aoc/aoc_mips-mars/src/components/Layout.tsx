import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { MODULES, moduleIndex } from '../data/modules'
import clsx from 'clsx'

function UnematMark() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-unemat-700 text-white font-bold text-sm shadow-sm">
        AOC
      </div>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold text-unemat-800">UNEMAT</div>
        <div className="text-[11px] text-unemat-600 -mt-0.5">Arq. e Org. de Computadores</div>
      </div>
    </div>
  )
}

function ProgressNav() {
  const location = useLocation()
  const idx = moduleIndex(location.pathname)
  return (
    <nav aria-label="Progresso da aula" className="border-t border-unemat-100 bg-white/70">
      <div className="mx-auto flex max-w-6xl items-stretch gap-1 overflow-x-auto px-3 py-2 sm:px-6">
        {MODULES.map((m, i) => {
          const active = i === idx
          const done = i < idx
          return (
            <Link
              key={m.id}
              to={m.path}
              className={clsx(
                'group flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                active
                  ? 'bg-unemat-700 text-white shadow-sm'
                  : done
                    ? 'bg-unemat-100 text-unemat-700 hover:bg-unemat-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              )}
            >
              <span
                className={clsx(
                  'grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold',
                  active ? 'bg-white text-unemat-700' : done ? 'bg-unemat-500 text-white' : 'bg-gray-300 text-white',
                )}
              >
                {i + 1}
              </span>
              {m.navLabel}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-unemat-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <UnematMark />
        </Link>
        <div className="hidden text-right text-xs text-unemat-700 sm:block">
          <div className="font-semibold">Do código C ao hardware</div>
          <div className="text-unemat-500">IA-32/x86 &amp; MIPS · MARS</div>
        </div>
      </div>
      <ProgressNav />
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-unemat-100 bg-unemat-900 text-unemat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-sm font-semibold text-white">Do código C ao hardware</div>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-unemat-200">
              Compreendendo Assembly e ISA com IA-32/x86 e MIPS — uma aula interativa para acompanhar, passo a
              passo, como um trecho em C se transforma em instruções executadas fisicamente pelo processador.
            </p>
          </div>
          <div className="text-xs leading-relaxed text-unemat-100 sm:text-right">
            <div>
              <span className="text-unemat-300">Professor:</span> Prof. Me. Juvenal Silva Neto
            </div>
            <div>
              <span className="text-unemat-300">Disciplina:</span> Arquitetura e Organização de Computadores
            </div>
            <div>
              <span className="text-unemat-300">Curso:</span> Bacharelado em Ciência da Computação
            </div>
            <div>
              <span className="text-unemat-300">Universidade:</span> Universidade do Estado de Mato Grosso — UNEMAT
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-6xl px-3 py-8 sm:px-6">{children}</main>
      <Footer />
    </div>
  )
}
