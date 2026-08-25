import { useState } from 'react'
import { PageHeader, Section, Callout, ModuleFooterNav } from '../components/PageChrome'
import { MICRO_EXAMPLES } from '../data/examples'

const INVESTIGATION_QUESTIONS = [
  'O que o código C solicita?',
  'Quais instruções foram necessárias?',
  'Quais são os operandos?',
  'Onde estão os dados?',
  'Houve acesso à memória?',
  'Qual foi o resultado?',
  'O que pertence à ISA?',
  'O que pertence ao hardware (microarquitetura)?',
]

const LAB_FILES = [
  { file: 'ola_mundo.asm', note: 'primeiro contato com o MARS: syscall de impressão de string.' },
  { file: 'operacoes_basicas.asm', note: 'soma e subtração — compare com o exemplo 3/4 desta aula.' },
  { file: 'exemplo01.asm', note: 'laço com sw em endereçamento indexado — compare com o exemplo 8 (vetor).' },
  { file: 'multiplica.asm', note: 'uso de mul e de $s0 para valores preservados.' },
  { file: 'questao9-code.asm', note: 'uso de move — compare com o que "move" expande por baixo dos panos.' },
]

export default function Lab() {
  const [exampleId, setExampleId] = useState(MICRO_EXAMPLES[2].id)
  const example = MICRO_EXAMPLES.find((e) => e.id === exampleId) ?? MICRO_EXAMPLES[0]
  const [answers, setAnswers] = useState<string[]>(Array(INVESTIGATION_QUESTIONS.length).fill(''))

  return (
    <div>
      <PageHeader
        kicker="Módulo 8"
        title="Prática de laboratório"
        subtitle="Da aplicação web ao MARS: consolide o percurso completo analisando código C, localizando registradores/memória e implementando os equivalentes MIPS."
      />

      <Section>
        <Callout>
          Ao final, você deve ser capaz de explicar autonomamente o percurso{' '}
          <strong>C → compilador → Assembly → ISA → linguagem de máquina → execução pelo hardware</strong> e por que
          o mesmo código de alto nível pode gerar sequências diferentes quando a ISA muda.
        </Callout>
      </Section>

      <Section title="Roteiro de investigação">
        <p className="mb-3 text-sm text-gray-600">
          Escolha um dos microprogramas já vistos e responda, nesta ordem, à cadeia de perguntas abaixo. Use as
          visualizações dos módulos anteriores (registradores, memória, data-path) para embasar cada resposta.
        </p>

        <select
          value={exampleId}
          onChange={(e) => {
            setExampleId(e.target.value)
            setAnswers(Array(INVESTIGATION_QUESTIONS.length).fill(''))
          }}
          className="mb-4 rounded-md border border-unemat-200 bg-white px-3 py-2 text-sm"
        >
          {MICRO_EXAMPLES.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>

        <div className="mb-4 rounded-lg border border-unemat-100 bg-[#0b1f14] p-3">
          <pre className="font-mono-code text-[12.5px] leading-relaxed text-gray-100">{example.cCode}</pre>
        </div>

        <div className="space-y-3">
          {INVESTIGATION_QUESTIONS.map((q, i) => (
            <div key={q} className="rounded-lg border border-unemat-100 p-3">
              <label className="mb-1.5 block text-sm font-semibold text-unemat-800">
                {i + 1}. {q}
              </label>
              <textarea
                value={answers[i]}
                onChange={(e) => setAnswers((a) => a.map((v, idx) => (idx === i ? e.target.value : v)))}
                rows={2}
                placeholder="Escreva sua resposta, revisando o código IA-32 e MIPS deste exemplo…"
                className="w-full rounded-md border border-unemat-200 px-2 py-1.5 text-sm text-gray-700 focus:border-unemat-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          As respostas ficam apenas nesta página, para orientar sua análise — anote as conclusões no seu relatório de
          laboratório.
        </p>
      </Section>

      <Section title="Agora no MARS de verdade">
        <p className="mb-3 text-sm text-gray-600">
          Abra o MARS e reproduza (ou implemente) os equivalentes MIPS a partir dos arquivos de exemplo da
          disciplina. Execute passo a passo e confira se os registradores mudam como você previu na aula web.
        </p>
        <ul className="space-y-2">
          {LAB_FILES.map((f) => (
            <li key={f.file} className="flex items-start gap-2 rounded-lg border border-unemat-100 p-3 text-sm">
              <code className="shrink-0 rounded bg-unemat-50 px-2 py-0.5 font-mono-code text-xs text-unemat-700">{f.file}</code>
              <span className="text-gray-600">{f.note}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Checklist final">
        <ul className="space-y-1.5 text-sm text-gray-700">
          <li>☐ Consigo apontar, em qualquer instrução, quais registradores são lidos e qual é escrito.</li>
          <li>☐ Consigo dizer se uma instrução acessa a RAM, e por quê (ou por que não).</li>
          <li>☐ Sei separar o que é da ISA (formato, registradores, instruções disponíveis) do que é da microarquitetura (implementação física).</li>
          <li>☐ Consigo comparar IA-32 e MIPS para o mesmo código C e explicar concretamente as diferenças.</li>
          <li>☐ Executei e conferi pelo menos um exemplo diretamente no MARS.</li>
        </ul>
      </Section>

      <ModuleFooterNav />
    </div>
  )
}
