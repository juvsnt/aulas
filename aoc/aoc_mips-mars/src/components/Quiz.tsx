import { useState } from 'react'
import clsx from 'clsx'
import type { QuizQuestion } from '../data/quizzes'

function QuizCard({ q, index }: { q: QuizQuestion; index: number }) {
  const [picked, setPicked] = useState<number | null>(null)
  const isCorrect = picked !== null && q.options[picked].correct

  return (
    <div className="rounded-lg border border-unemat-100 p-4">
      <div className="mb-2 text-sm font-semibold text-unemat-800">
        {index + 1}. {q.question}
      </div>
      <div className="flex flex-col gap-1.5">
        {q.options.map((opt, i) => {
          const chosen = picked === i
          const revealed = picked !== null
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              disabled={picked !== null}
              className={clsx(
                'rounded-md border px-3 py-1.5 text-left text-xs transition-colors',
                !revealed && 'border-unemat-200 hover:bg-unemat-50',
                revealed && opt.correct && 'border-unemat-500 bg-unemat-50 text-unemat-800 font-medium',
                revealed && chosen && !opt.correct && 'border-red-300 bg-red-50 text-red-700',
                revealed && !chosen && !opt.correct && 'border-gray-100 text-gray-400',
              )}
            >
              {opt.text}
              {revealed && opt.correct && ' ✓'}
              {revealed && chosen && !opt.correct && ' ✗'}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <p className={clsx('mt-2 text-xs leading-relaxed', isCorrect ? 'text-unemat-700' : 'text-red-700')}>
          {isCorrect ? 'Correto! ' : 'Não exatamente. '}
          {q.explanation}
        </p>
      )}
    </div>
  )
}

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <QuizCard key={i} q={q} index={i} />
      ))}
    </div>
  )
}
