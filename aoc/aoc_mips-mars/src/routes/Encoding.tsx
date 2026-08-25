import { PageHeader, Section, Callout, ModuleFooterNav } from '../components/PageChrome'
import RFormatEncoder from '../components/RFormatEncoder'

export default function Encoding() {
  return (
    <div>
      <PageHeader
        kicker="Módulo 4"
        title="Assembly, ISA e linguagem de máquina"
        subtitle="C → Assembly IA-32/MIPS → bytes da instrução → interpretação pela ISA. Sem transformar isso num estudo exaustivo do formato — só o suficiente para ver os bits de verdade."
      />

      <Section>
        <Callout>
          <code className="rounded bg-white/60 px-1 font-mono-code">ADD EAX, EBX</code> é uma representação
          Assembly. O processador recebe uma <strong>codificação binária</strong> correspondente, definida pela ISA.
          Vamos ver isso acontecer de verdade com um exemplo do MIPS, seguindo o mesmo algoritmo usado em aula.
        </Callout>
      </Section>

      <Section title="Exemplo trabalhado: a = b + c;">
        <p className="mb-3 text-sm text-gray-600">O algoritmo de conversão tem quatro passos:</p>
        <ol className="mb-4 list-inside list-decimal space-y-1 text-sm text-gray-700">
          <li>Converter a instrução de alto nível para Linguagem de Montagem (Assembly).</li>
          <li>Converter a instrução em Assembly para Linguagem de Máquina (nomes → números de registrador).</li>
          <li>Fazer a representação da instrução no formato correspondente (aqui, formato tipo R).</li>
          <li>Converter a representação para Código de Máquina (bits).</li>
        </ol>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <StepCard n={1} title="Alto nível → Assembly">
              <code className="font-mono-code">a = b + c;</code> com <code className="font-mono-code">a=$t0</code>,{' '}
              <code className="font-mono-code">b=$s0</code>, <code className="font-mono-code">c=$s1</code> vira:
              <div className="mt-1 rounded bg-[#0b1f14] px-2 py-1 font-mono-code text-unemat-100">ADD $t0, $s0, $s1</div>
            </StepCard>
            <StepCard n={2} title="Assembly → nomes por números">
              Cada registrador tem um número (tabela oficial MIPS32):
              <div className="mt-1 rounded bg-[#0b1f14] px-2 py-1 font-mono-code text-unemat-100">ADD $8, $16, $17</div>
            </StepCard>
          </div>
          <div className="space-y-2">
            <StepCard n={3} title="Representação no formato R">
              <div className="font-mono-code text-[11px]">op=0, rs=16, rt=17, rd=8, shamt=0, funct=32</div>
            </StepCard>
            <StepCard n={4} title="Código de máquina (32 bits)">
              <div className="mt-1 break-all rounded bg-[#0b1f14] px-2 py-1 font-mono-code text-[11px] tracking-widest text-unemat-100">
                00000010000100010100000000100000
              </div>
            </StepCard>
          </div>
        </div>
      </Section>

      <Section title="Monte sua própria instrução tipo R">
        <p className="mb-3 text-sm text-gray-600">
          Escolha a instrução e os registradores: os campos e os bits são recalculados a partir da tabela real de
          opcodes/funct do MIPS32 — a mesma usada pelo interpretador desta aula.
        </p>
        <RFormatEncoder />
      </Section>

      <Section title="E no IA-32?">
        <p className="mb-3 text-sm text-gray-600">
          O IA-32 usa codificação de tamanho variável (1 a 15 bytes por instrução), bem mais elaborada que o formato
          fixo do MIPS. Sem esgotar o assunto, vale ver um único caso real:
        </p>
        <div className="rounded-lg border border-unemat-100 bg-unemat-50/60 p-4 text-sm">
          <div className="mb-2 font-mono-code text-unemat-800">ADD EAX, EBX</div>
          <div className="mb-3 flex flex-wrap gap-2 font-mono-code text-xs">
            <span className="rounded bg-[#0b1f14] px-2 py-1 text-unemat-100">01</span>
            <span className="rounded bg-[#0b1f14] px-2 py-1 text-unemat-100">D8</span>
          </div>
          <ul className="list-inside list-disc space-y-1 text-xs text-gray-700">
            <li>
              <code className="font-mono-code">01</code> é o opcode de <code className="font-mono-code">ADD r/m32, r32</code> (soma
              registrador-para-registrador de 32 bits).
            </li>
            <li>
              <code className="font-mono-code">D8</code> é o byte ModR/M: os bits <code className="font-mono-code">11</code>{' '}
              indicam "operando é registrador", <code className="font-mono-code">011</code> identifica EBX (fonte) e{' '}
              <code className="font-mono-code">000</code> identifica EAX (destino).
            </li>
          </ul>
        </div>
      </Section>

      <ModuleFooterNav />
    </div>
  )
}

function StepCard({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-unemat-100 p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-unemat-700 text-[10px] font-bold text-white">{n}</span>
        <span className="text-xs font-semibold text-unemat-800">{title}</span>
      </div>
      <div className="text-xs leading-relaxed text-gray-700">{children}</div>
    </div>
  )
}
