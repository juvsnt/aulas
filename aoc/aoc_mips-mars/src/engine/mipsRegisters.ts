// Tabela oficial dos 32 registradores de uso geral do MIPS 32 bits,
// extraída de "tabela 32 registradores de uso geral do MIPS 32bits.pdf"
// (material da disciplina).

export interface MipsRegisterInfo {
  name: string // com o prefixo $, ex: "$t0"
  number: number
  binary: string
  use: string
  /** true = deve ser preservado entre chamadas de função (convenção de chamada) */
  saved: boolean
}

export const MIPS_REGISTER_INFO: MipsRegisterInfo[] = [
  { name: '$zero', number: 0, binary: '00000', use: 'constante zero', saved: false },
  { name: '$at', number: 1, binary: '00001', use: 'reservado para o montador', saved: false },
  { name: '$v0', number: 2, binary: '00010', use: 'avaliação de expressão e resultado de função', saved: false },
  { name: '$v1', number: 3, binary: '00011', use: 'avaliação de expressão e resultado de função', saved: false },
  { name: '$a0', number: 4, binary: '00100', use: 'argumento 1', saved: false },
  { name: '$a1', number: 5, binary: '00101', use: 'argumento 2', saved: false },
  { name: '$a2', number: 6, binary: '00110', use: 'argumento 3', saved: false },
  { name: '$a3', number: 7, binary: '00111', use: 'argumento 4', saved: false },
  { name: '$t0', number: 8, binary: '01000', use: 'temporário (não preservado)', saved: false },
  { name: '$t1', number: 9, binary: '01001', use: 'temporário (não preservado)', saved: false },
  { name: '$t2', number: 10, binary: '01010', use: 'temporário (não preservado)', saved: false },
  { name: '$t3', number: 11, binary: '01011', use: 'temporário (não preservado)', saved: false },
  { name: '$t4', number: 12, binary: '01100', use: 'temporário (não preservado)', saved: false },
  { name: '$t5', number: 13, binary: '01101', use: 'temporário (não preservado)', saved: false },
  { name: '$t6', number: 14, binary: '01110', use: 'temporário (não preservado)', saved: false },
  { name: '$t7', number: 15, binary: '01111', use: 'temporário (não preservado)', saved: false },
  { name: '$s0', number: 16, binary: '10000', use: 'temporário salvo (preservado)', saved: true },
  { name: '$s1', number: 17, binary: '10001', use: 'temporário salvo (preservado)', saved: true },
  { name: '$s2', number: 18, binary: '10010', use: 'temporário salvo (preservado)', saved: true },
  { name: '$s3', number: 19, binary: '10011', use: 'temporário salvo (preservado)', saved: true },
  { name: '$s4', number: 20, binary: '10100', use: 'temporário salvo (preservado)', saved: true },
  { name: '$s5', number: 21, binary: '10101', use: 'temporário salvo (preservado)', saved: true },
  { name: '$s6', number: 22, binary: '10110', use: 'temporário salvo (preservado)', saved: true },
  { name: '$s7', number: 23, binary: '10111', use: 'temporário salvo (preservado)', saved: true },
  { name: '$t8', number: 24, binary: '11000', use: 'temporário (não preservado)', saved: false },
  { name: '$t9', number: 25, binary: '11001', use: 'temporário (não preservado)', saved: false },
  { name: '$k0', number: 26, binary: '11010', use: 'reservado para o kernel do SO', saved: false },
  { name: '$k1', number: 27, binary: '11011', use: 'reservado para o kernel do SO', saved: false },
  { name: '$gp', number: 28, binary: '11100', use: 'ponteiro para área global', saved: false },
  { name: '$sp', number: 29, binary: '11101', use: 'stack pointer', saved: false },
  { name: '$fp', number: 30, binary: '11110', use: 'frame pointer', saved: true },
  { name: '$ra', number: 31, binary: '11111', use: 'endereço de retorno de procedimento', saved: false },
]

export const MIPS_REGISTER_NAMES = MIPS_REGISTER_INFO.map((r) => r.name)

export const MIPS_REGISTER_BY_NUMBER: Record<number, string> = Object.fromEntries(
  MIPS_REGISTER_INFO.map((r) => [r.number, r.name]),
)

export function normalizeMipsRegister(token: string): string {
  let t = token.trim()
  if (!t.startsWith('$')) t = '$' + t
  if (/^\$\d+$/.test(t)) {
    const num = Number(t.slice(1))
    const name = MIPS_REGISTER_BY_NUMBER[num]
    if (!name) throw new Error(`Registrador numérico inválido: ${t}`)
    return name
  }
  if (!MIPS_REGISTER_NAMES.includes(t)) {
    throw new Error(`Registrador MIPS desconhecido: ${token}`)
  }
  return t
}
