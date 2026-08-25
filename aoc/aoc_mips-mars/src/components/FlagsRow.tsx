import clsx from 'clsx'

interface Props {
  flags: Record<string, boolean>
  writtenFlags?: string[]
}

const FLAG_DESC: Record<string, string> = {
  ZF: 'zero',
  SF: 'sinal',
  OF: 'overflow',
  CF: 'carry',
}

export default function FlagsRow({ flags, writtenFlags = [] }: Props) {
  const written = new Set(writtenFlags)
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(flags).map(([name, value]) => (
        <div
          key={name}
          className={clsx(
            'flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono-code text-xs transition-all duration-300',
            written.has(name)
              ? 'border-accent-flag bg-red-50 animate-pulse-glow'
              : value
                ? 'border-unemat-400 bg-unemat-50'
                : 'border-gray-200 bg-gray-50',
          )}
          title={FLAG_DESC[name]}
        >
          <span className={clsx('font-semibold', written.has(name) ? 'text-accent-flag' : 'text-gray-600')}>{name}</span>
          <span className={clsx('rounded px-1', value ? 'bg-unemat-600 text-white' : 'bg-gray-300 text-white')}>
            {value ? 1 : 0}
          </span>
        </div>
      ))}
    </div>
  )
}
