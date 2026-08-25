import { Link } from 'react-router-dom'
import { PageHeader, Section, Callout, ModuleFooterNav } from '../components/PageChrome'
import PipelineDiagram from '../components/PipelineDiagram'

export default function Intro() {
  return (
    <div>
      <PageHeader
        kicker="Arquitetura e Organização de Computadores · UNEMAT"
        title="Do código C ao hardware"
        subtitle="Como uma pequena construção escrita em C se transforma em instruções que um processador executa fisicamente?"
      />

      <Section>
        <Callout tone="question">
          Essa é a pergunta que guia toda a aula. Vamos responder a ela progressivamente, acompanhando o mesmo
          percurso repetidas vezes, com programas cada vez um pouco mais complexos:
          <strong> C → compilador → Assembly → ISA → linguagem de máquina → registradores/memória → hardware.</strong>
        </Callout>
      </Section>

      <Section title="O percurso, camada por camada">
        <p className="mb-4 text-sm text-gray-600">
          Clique em cada etapa para entender o que ela representa e por que ela é diferente das demais.
        </p>
        <PipelineDiagram />
      </Section>

      <Section title="Três confusões comuns — e por que evitá-las">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-unemat-100 p-4">
            <div className="mb-1 text-sm font-bold text-unemat-800">C não é executado pelo processador</div>
            <p className="text-xs leading-relaxed text-gray-600">
              O processador nunca "vê" C. Ele executa apenas a codificação binária de instruções da sua ISA. C é
              apenas o ponto de partida legível por humanos.
            </p>
          </div>
          <div className="rounded-lg border border-unemat-100 p-4">
            <div className="mb-1 text-sm font-bold text-unemat-800">Assembly ≠ o que o processador recebe</div>
            <p className="text-xs leading-relaxed text-gray-600">
              <code className="rounded bg-unemat-50 px-1 font-mono-code">ADD EAX, EBX</code> é uma representação
              textual para humanos. O processador recebe a codificação binária correspondente, definida pela ISA.
            </p>
          </div>
          <div className="rounded-lg border border-unemat-100 p-4">
            <div className="mb-1 text-sm font-bold text-unemat-800">ISA ≠ microarquitetura</div>
            <p className="text-xs leading-relaxed text-gray-600">
              A ISA é o contrato (quais instruções existem); a microarquitetura é a implementação física. Dois
              processadores diferentes podem implementar a mesma ISA de formas internas bem distintas.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Como a aula está organizada">
        <ol className="space-y-2 text-sm text-gray-700">
          <li>
            <Link to="/ia32" className="font-semibold text-unemat-700 hover:underline">
              1. Máquina real: Pentium 4 e IA-32
            </Link>{' '}
            — registradores, flags, ALU e o ciclo de execução, na ISA que aproxima da realidade do laboratório.
          </li>
          <li>
            <Link to="/ia32/exemplos" className="font-semibold text-unemat-700 hover:underline">
              2. Dez microprogramas em C → IA-32
            </Link>{' '}
            — de <code className="font-mono-code">return 10;</code> até chamada de função, sempre perguntando "onde
            estão os dados?".
          </li>
          <li>
            <Link to="/codificacao" className="font-semibold text-unemat-700 hover:underline">
              3. Assembly, ISA e linguagem de máquina
            </Link>{' '}
            — como uma instrução Assembly vira, de fato, bits.
          </li>
          <li>
            <Link to="/mips" className="font-semibold text-unemat-700 hover:underline">
              4. Trocando a ISA: MIPS
            </Link>{' '}
            — os mesmos programas, com o simulador MARS.
          </li>
          <li>
            <Link to="/comparador" className="font-semibold text-unemat-700 hover:underline">
              5. Comparador interativo IA-32 × MIPS
            </Link>{' '}
            — lado a lado, instrução por instrução.
          </li>
          <li>
            <Link to="/laboratorio" className="font-semibold text-unemat-700 hover:underline">
              6. Laboratório
            </Link>{' '}
            — consolidando tudo na prática, com o MARS.
          </li>
        </ol>
      </Section>

      <ModuleFooterNav />
    </div>
  )
}
