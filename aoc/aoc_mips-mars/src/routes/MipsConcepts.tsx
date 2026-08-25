import { PageHeader, Section, Callout, ModuleFooterNav } from '../components/PageChrome'
import { MIPS_REGISTER_INFO } from '../engine/mipsRegisters'
import marsTelaInteira from '../assets/mars/mars-tela-inteira.png'
import marsPassoAPasso from '../assets/mars/mars-passo-a-passo.png'

export default function MipsConcepts() {
  return (
    <div>
      <PageHeader
        kicker="Módulo 5"
        title="E se trocarmos a ISA?"
        subtitle="Até aqui, tudo em IA-32. Mantendo o mesmo programa em C, o que muda se trocarmos a arquitetura do conjunto de instruções?"
      />

      <Section>
        <Callout tone="question">
          <strong>C → IA-32/x86 → MIPS.</strong> A partir de agora, reapresentamos os mesmos 10 microprogramas —
          mas gerando código para o MIPS32, a ISA RISC criada em Stanford (empresa fundada em 1984, com John L.
          Hennessy entre os fundadores), usada historicamente em Nintendo 64, PlayStation original e roteadores
          Cisco.
        </Callout>
      </Section>

      <Section title="MIPS32: os 32 registradores de uso geral">
        <p className="mb-3 text-sm text-gray-600">
          Convenção usada nesta aula (e nos materiais da disciplina): variáveis "fonte" de longa duração em{' '}
          <code className="font-mono-code">$s0-$s7</code>, valores temporários em <code className="font-mono-code">$t0-$t9</code>,
          argumentos de função em <code className="font-mono-code">$a0-$a3</code> e retorno em{' '}
          <code className="font-mono-code">$v0-$v1</code>.
        </p>
        <div className="overflow-x-auto rounded-lg border border-unemat-100">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-unemat-50 text-unemat-700">
              <tr>
                <th className="px-2 py-1.5">Nome</th>
                <th className="px-2 py-1.5">Número</th>
                <th className="px-2 py-1.5">Binário</th>
                <th className="px-2 py-1.5">Uso</th>
              </tr>
            </thead>
            <tbody>
              {MIPS_REGISTER_INFO.map((r) => (
                <tr key={r.name} className="border-t border-unemat-50">
                  <td className="px-2 py-1 font-mono-code font-semibold text-unemat-800">{r.name}</td>
                  <td className="px-2 py-1 font-mono-code text-gray-600">{r.number}</td>
                  <td className="px-2 py-1 font-mono-code text-gray-400">{r.binary}</td>
                  <td className="px-2 py-1 text-gray-700">{r.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="O simulador MARS">
        <p className="mb-3 text-sm text-gray-600">
          O MARS (MIPS Assembler and Runtime Simulator) é o ambiente usado no laboratório para montar e executar
          programas MIPS de verdade, com execução passo a passo e inspeção de registradores/memória — exatamente o
          que esta aula reproduz na web antes de você ir ao laboratório.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <figure className="overflow-hidden rounded-lg border border-unemat-100">
            <img src={marsTelaInteira} alt="Tela principal do simulador MARS" className="w-full" />
            <figcaption className="bg-unemat-50 px-2 py-1 text-[11px] text-unemat-700">Editor + registradores no MARS</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-lg border border-unemat-100">
            <img src={marsPassoAPasso} alt="Execução passo a passo no MARS" className="w-full" />
            <figcaption className="bg-unemat-50 px-2 py-1 text-[11px] text-unemat-700">Execução passo a passo (botão de step)</figcaption>
          </figure>
        </div>
      </Section>

      <Section title="O que muda ao trocar a ISA?">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-unemat-100 p-4">
            <div className="mb-1 text-sm font-bold text-unemat-800">IA-32 é CISC-leaning</div>
            <p className="text-xs leading-relaxed text-gray-600">
              Instruções de 2 operandos (destino também é fonte), tamanho variável, modos de endereçamento ricos
              (ex.: índice×escala embutido no MOV).
            </p>
          </div>
          <div className="rounded-lg border border-unemat-100 p-4">
            <div className="mb-1 text-sm font-bold text-unemat-800">MIPS é RISC</div>
            <p className="text-xs leading-relaxed text-gray-600">
              Instruções de 3 operandos, tamanho fixo (32 bits), poucos modos de endereçamento — cálculos de
              endereço mais elaborados viram instruções extras explícitas.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Guarde essas diferenças de forma concreta, não como rótulo: nos próximos módulos você vai observá-las
          acontecendo, instrução por instrução, nos mesmos programas.
        </p>
      </Section>

      <ModuleFooterNav />
    </div>
  )
}
