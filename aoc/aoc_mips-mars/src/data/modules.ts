export interface ModuleDef {
  id: string
  path: string
  navLabel: string
  title: string
  subtitle: string
}

export const MODULES: ModuleDef[] = [
  {
    id: 'intro',
    path: '/',
    navLabel: 'Início',
    title: 'Do código C ao hardware',
    subtitle: 'O percurso: alto nível → Assembly → ISA → linguagem de máquina → hardware',
  },
  {
    id: 'ia32-conceitos',
    path: '/ia32',
    navLabel: 'IA-32: a máquina',
    title: 'Máquina real: Pentium 4 e IA-32',
    subtitle: 'Registradores, flags, ALU e o ciclo busca-decodificação-execução',
  },
  {
    id: 'ia32-exemplos',
    path: '/ia32/exemplos',
    navLabel: 'IA-32: exemplos',
    title: 'De C a IA-32, instrução por instrução',
    subtitle: '10 microprogramas progressivos — onde estão os dados?',
  },
  {
    id: 'codificacao',
    path: '/codificacao',
    navLabel: 'Codificação',
    title: 'Assembly, ISA e linguagem de máquina',
    subtitle: 'De ADD $t0,$s0,$s1 aos bits que o processador realmente recebe',
  },
  {
    id: 'mips-conceitos',
    path: '/mips',
    navLabel: 'MIPS: a ISA',
    title: 'E se trocarmos a ISA?',
    subtitle: 'Introdução ao MIPS32 e ao simulador MARS',
  },
  {
    id: 'mips-exemplos',
    path: '/mips/exemplos',
    navLabel: 'MIPS: exemplos',
    title: 'Os mesmos 10 programas, agora em MIPS',
    subtitle: 'C → IA-32 → MIPS: o que muda quando a ISA muda?',
  },
  {
    id: 'comparador',
    path: '/comparador',
    navLabel: 'Comparador',
    title: 'IA-32 × MIPS, lado a lado',
    subtitle: 'Avance instrução por instrução nas duas ISAs ao mesmo tempo',
  },
  {
    id: 'laboratorio',
    path: '/laboratorio',
    navLabel: 'Laboratório',
    title: 'Prática de laboratório',
    subtitle: 'Da aplicação web ao MARS: consolidando o percurso completo',
  },
]

export function moduleIndex(path: string): number {
  const idx = MODULES.findIndex((m) => m.path === path)
  return idx === -1 ? 0 : idx
}
