import { PageHeader, Section, Callout, ModuleFooterNav } from '../components/PageChrome'
import { IA32_REGISTER_INFO, IA32_FLAG_INFO } from '../data/ia32Registers'
import FetchDecodeExecute from '../components/FetchDecodeExecute'
import DataPathDiagram from '../components/DataPathDiagram'

export default function Ia32Concepts() {
  return (
    <div>
      <PageHeader
        kicker="Módulo 2"
        title="Máquina real: Pentium 4 e IA-32"
        subtitle="Adotamos um computador com Intel Pentium 4, IA-32/x86 de 32 bits, para aproximar a explicação da realidade do laboratório. Sem x86-64 nos exemplos principais."
      />

      <Section>
        <Callout>
          <strong>ISA IA-32/x86 ≠ microarquitetura Pentium 4.</strong> A ISA define quais instruções e registradores
          existem; o Pentium 4 é apenas uma das muitas implementações físicas possíveis dessa mesma ISA — outros
          processadores Intel/AMD, de outras gerações, implementam a mesma IA-32 com circuitos internos diferentes
          (pipelines mais longos ou mais curtos, previsão de desvio distinta, caches diferentes).
        </Callout>
      </Section>

      <Section title="Registradores de propósito geral (32 bits)">
        <p className="mb-3 text-sm text-gray-600">
          Apresentamos apenas os elementos necessários à compreensão: oito registradores de 32 bits mais o contador
          de instrução EIP.
        </p>
        <div className="overflow-hidden rounded-lg border border-unemat-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-unemat-50 text-unemat-700">
              <tr>
                <th className="px-3 py-2 font-semibold">Registrador</th>
                <th className="px-3 py-2 font-semibold">Nome histórico</th>
                <th className="px-3 py-2 font-semibold">Uso</th>
              </tr>
            </thead>
            <tbody>
              {IA32_REGISTER_INFO.map((r) => (
                <tr key={r.name} className="border-t border-unemat-50">
                  <td className="px-3 py-2 font-mono-code font-semibold text-unemat-800">{r.name}</td>
                  <td className="px-3 py-2 text-gray-500 italic">{r.historicalName}</td>
                  <td className="px-3 py-2 text-gray-700">{r.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Flags relevantes">
        <p className="mb-3 text-sm text-gray-600">
          Depois de instruções aritméticas ou de comparação (CMP), a ALU atualiza bits de estado no registrador de
          flags. Os desvios condicionais (JE, JG, JL...) leem essas flags para decidir se desviam.
        </p>
        <div className="grid gap-2 sm:grid-cols-4">
          {IA32_FLAG_INFO.map((f) => (
            <div key={f.name} className="rounded-lg border border-unemat-100 p-3">
              <div className="font-mono-code text-sm font-bold text-unemat-800">{f.name}</div>
              <div className="mt-1 text-xs text-gray-600">{f.use}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Ciclo de busca, decodificação e execução">
        <FetchDecodeExecute />
      </Section>

      <Section title="RAM ↔ CPU ↔ Registradores ↔ ALU">
        <p className="mb-3 text-sm text-gray-600">
          Este é o diagrama que vamos reutilizar em toda a aula: ele mostra, a cada instrução, se os dados ficaram
          apenas entre registradores e ALU, ou se precisaram atravessar o barramento até a RAM.
        </p>
        <DataPathDiagram event={null} tick={0} />
      </Section>

      <ModuleFooterNav />
    </div>
  )
}
