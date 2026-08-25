import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { MODULES, moduleIndex } from '../data/modules'

export function PageHeader({ title, subtitle, kicker }: { title: string; subtitle: string; kicker?: string }) {
  return (
    <header className="mb-8">
      {kicker && <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-unemat-500">{kicker}</div>}
      <h1 className="text-2xl font-bold text-unemat-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">{subtitle}</p>
    </header>
  )
}

export function Section({ title, children, id }: { title?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-10 scroll-mt-28">
      {title && <h2 className="mb-3 text-lg font-bold text-unemat-800">{title}</h2>}
      {children}
    </section>
  )
}

export function Callout({ tone = 'info', children }: { tone?: 'info' | 'question' | 'warning'; children: ReactNode }) {
  const styles = {
    info: 'border-unemat-200 bg-unemat-50 text-unemat-900',
    question: 'border-amber-200 bg-amber-50 text-amber-900',
    warning: 'border-red-200 bg-red-50 text-red-900',
  }[tone]
  const icon = { info: 'ℹ️', question: '❓', warning: '⚠️' }[tone]
  return (
    <div className={`flex gap-2.5 rounded-lg border px-4 py-3 text-sm leading-relaxed ${styles}`}>
      <span className="shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  )
}

export function ModuleFooterNav() {
  const location = useLocation()
  const idx = moduleIndex(location.pathname)
  const prev = MODULES[idx - 1]
  const next = MODULES[idx + 1]
  return (
    <div className="mt-12 flex items-center justify-between border-t border-unemat-100 pt-6">
      {prev ? (
        <Link to={prev.path} className="group max-w-[45%] text-sm text-unemat-600 hover:text-unemat-800">
          <div className="text-[11px] text-gray-400">← anterior</div>
          <div className="font-medium group-hover:underline">{prev.navLabel}</div>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.path} className="group max-w-[45%] text-right text-sm text-unemat-600 hover:text-unemat-800">
          <div className="text-[11px] text-gray-400">próximo →</div>
          <div className="font-medium group-hover:underline">{next.navLabel}</div>
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}
