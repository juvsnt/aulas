import clsx from 'clsx'

interface Props {
  onBack: () => void
  onForward: () => void
  onReset: () => void
  onRunToEnd: () => void
  canBack: boolean
  canForward: boolean
  stepLabel: string
}

function Btn({
  onClick,
  disabled,
  children,
  variant = 'ghost',
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary'
          ? 'bg-unemat-700 text-white hover:bg-unemat-800'
          : 'border border-unemat-200 text-unemat-700 hover:bg-unemat-50',
      )}
    >
      {children}
    </button>
  )
}

export default function StepperControls({ onBack, onForward, onReset, onRunToEnd, canBack, canForward, stepLabel }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-2">
        <Btn onClick={onReset} disabled={!canBack}>
          ⟲ reiniciar
        </Btn>
        <Btn onClick={onBack} disabled={!canBack}>
          ← anterior
        </Btn>
        <Btn onClick={onForward} disabled={!canForward} variant="primary">
          próxima instrução →
        </Btn>
        <Btn onClick={onRunToEnd} disabled={!canForward}>
          executar tudo ⏭
        </Btn>
      </div>
      <span className="text-xs text-gray-500">{stepLabel}</span>
    </div>
  )
}
