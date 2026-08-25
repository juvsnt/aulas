// Interpretador real (subconjunto) de MIPS32, compatível com a sintaxe usada
// pelo MARS/SPIM e com os materiais da disciplina (Guia Rápido MIPS,
// aula4e/aula4f). Assembla um texto .s/.asm em instruções decodificadas e
// executa passo a passo, produzindo eventos para animar o data-path.

import { AssemblyError, Memory, splitOperands, stripComment, toI32, type StepEvent } from './common'
import { MIPS_REGISTER_NAMES, normalizeMipsRegister } from './mipsRegisters'

export const MIPS_TEXT_BASE = 0x00400000
export const MIPS_DATA_BASE = 0x10010000
export const MIPS_INITIAL_SP = 0x7ffffffc
export const MIPS_INITIAL_GP = 0x10008000

export type MipsFormat = 'R' | 'I' | 'J' | 'pseudo' | 'syscall'

export interface MipsOpInfo {
  format: MipsFormat
  /** opcode de 6 bits (decimal); para R-type é sempre 0 */
  opcode: number
  /** funct de 6 bits (apenas formato R) */
  funct?: number
  pseudo?: boolean
  desc: string
}

// Tabela ISA real do MIPS32 (valores conferidos com a especificação oficial;
// usada tanto para execução quanto para a visualização de codificação binária).
export const MIPS_OPS: Record<string, MipsOpInfo> = {
  add: { format: 'R', opcode: 0, funct: 32, desc: 'soma com sinal' },
  addu: { format: 'R', opcode: 0, funct: 33, desc: 'soma sem sinal' },
  sub: { format: 'R', opcode: 0, funct: 34, desc: 'subtração com sinal' },
  subu: { format: 'R', opcode: 0, funct: 35, desc: 'subtração sem sinal' },
  and: { format: 'R', opcode: 0, funct: 36, desc: 'AND lógico' },
  or: { format: 'R', opcode: 0, funct: 37, desc: 'OR lógico' },
  xor: { format: 'R', opcode: 0, funct: 38, desc: 'XOR lógico' },
  nor: { format: 'R', opcode: 0, funct: 39, desc: 'NOR lógico' },
  slt: { format: 'R', opcode: 0, funct: 42, desc: 'set-less-than (com sinal)' },
  sltu: { format: 'R', opcode: 0, funct: 43, desc: 'set-less-than (sem sinal)' },
  sll: { format: 'R', opcode: 0, funct: 0, desc: 'deslocamento lógico à esquerda' },
  srl: { format: 'R', opcode: 0, funct: 2, desc: 'deslocamento lógico à direita' },
  sra: { format: 'R', opcode: 0, funct: 3, desc: 'deslocamento aritmético à direita' },
  jr: { format: 'R', opcode: 0, funct: 8, desc: 'desvio para endereço em registrador' },
  mult: { format: 'R', opcode: 0, funct: 24, desc: 'multiplicação 32x32 -> Hi:Lo' },
  multu: { format: 'R', opcode: 0, funct: 25, desc: 'multiplicação sem sinal 32x32 -> Hi:Lo' },
  div: { format: 'R', opcode: 0, funct: 26, desc: 'divisão -> Lo=quociente, Hi=resto' },
  divu: { format: 'R', opcode: 0, funct: 27, desc: 'divisão sem sinal' },
  mfhi: { format: 'R', opcode: 0, funct: 16, desc: 'copia Hi para registrador' },
  mflo: { format: 'R', opcode: 0, funct: 18, desc: 'copia Lo para registrador' },

  addi: { format: 'I', opcode: 8, desc: 'soma com imediato (com sinal)' },
  addiu: { format: 'I', opcode: 9, desc: 'soma com imediato (sem sinal)' },
  andi: { format: 'I', opcode: 12, desc: 'AND com imediato' },
  ori: { format: 'I', opcode: 13, desc: 'OR com imediato' },
  xori: { format: 'I', opcode: 14, desc: 'XOR com imediato' },
  slti: { format: 'I', opcode: 10, desc: 'set-less-than imediato' },
  lw: { format: 'I', opcode: 35, desc: 'carrega word da RAM para registrador' },
  sw: { format: 'I', opcode: 43, desc: 'grava word do registrador na RAM' },
  lb: { format: 'I', opcode: 32, desc: 'carrega byte da RAM' },
  sb: { format: 'I', opcode: 40, desc: 'grava byte na RAM' },
  lui: { format: 'I', opcode: 15, desc: 'carrega imediato na metade alta' },
  beq: { format: 'I', opcode: 4, desc: 'desvia se registrador0 == registrador1' },
  bne: { format: 'I', opcode: 5, desc: 'desvia se registrador0 != registrador1' },

  j: { format: 'J', opcode: 2, desc: 'desvio incondicional' },
  jal: { format: 'J', opcode: 3, desc: 'chamada de subrotina (salva PC+4 em $ra)' },

  // pseudo-instruções: o montador (assembler) as expande em uma ou mais
  // instruções reais da ISA antes de gerar o código de máquina.
  li: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: carrega imediato (expande p/ addi ou lui+ori)' },
  la: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: carrega endereço de rótulo (expande p/ lui+ori)' },
  move: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: copia registrador (expande p/ add rd,rs,$zero)' },
  b: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: desvio incondicional (expande p/ beq $zero,$zero)' },
  blt: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: desvia se <  (expande p/ slt + bne)' },
  ble: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: desvia se <= (expande p/ slt + beq)' },
  bgt: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: desvia se >  (expande p/ slt + bne)' },
  bge: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: desvia se >= (expande p/ slt + beq)' },
  mul: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: multiplica p/ registrador (expande p/ mult+mflo)' },
  neg: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: nega (expande p/ sub rd,$zero,rs)' },
  not: { format: 'pseudo', opcode: -1, pseudo: true, desc: 'pseudo: NOT bit a bit (expande p/ nor rd,rs,$zero)' },

  syscall: { format: 'syscall', opcode: 0, funct: 12, desc: 'chamada de sistema (E/S, saída do programa)' },
}

// Instruções cujo cálculo de fato passa pela ALU (aritmética/lógica/deslocamento,
// e comparações de desvio, que internamente subtraem para comparar). Movimentação
// pura de dado (li, la, move, lw, sw, mfhi/mflo, desvios incondicionais) não usa a ALU.
const ALU_INVOLVED_MIPS = new Set([
  'add', 'addu', 'sub', 'subu', 'and', 'or', 'xor', 'nor', 'slt', 'sltu',
  'sll', 'srl', 'sra', 'mult', 'multu', 'div', 'divu',
  'addi', 'addiu', 'andi', 'ori', 'xori', 'slti', 'lui',
  'neg', 'not', 'mul', 'beq', 'bne', 'blt', 'ble', 'bgt', 'bge',
])

export interface MipsInstruction {
  text: string
  sourceLine: number
  op: string
  args: string[]
}

export interface MipsDataLabel {
  address: number
  size: number
  kind: 'word' | 'byte' | 'asciiz' | 'space'
}

export interface MipsProgram {
  instructions: MipsInstruction[]
  textLabels: Record<string, number>
  dataLabels: Record<string, MipsDataLabel>
  initialMemory: Memory
  entryIndex: number
  source: string
}

export interface MipsState {
  registers: Record<string, number>
  hi: number
  lo: number
  pc: number // índice da instrução (não endereço de byte)
  memory: Memory
  halted: boolean
  output: string[]
  inputQueue: number[]
}

function parseIntLiteral(tok: string): number {
  const t = tok.trim()
  if (/^0x[0-9a-fA-F]+$/.test(t)) return parseInt(t, 16)
  if (/^-?\d+$/.test(t)) return parseInt(t, 10)
  throw new Error(`Valor numérico inválido: ${tok}`)
}

function parseMemOperand(token: string): { offset: number; base: string | null; label: string | null } {
  const t = token.trim()
  const m = t.match(/^(-?\w*)\((\$\w+)\)$/)
  if (m) {
    const offTok = m[1]
    const offset = offTok === '' ? 0 : parseIntLiteral(offTok)
    return { offset, base: normalizeMipsRegister(m[2]), label: null }
  }
  return { offset: 0, base: null, label: t }
}

export function assembleMips(source: string): MipsProgram {
  const lines = source.split('\n')
  const instructions: MipsInstruction[] = []
  const textLabels: Record<string, number> = {}
  const dataLabels: Record<string, MipsDataLabel> = {}
  const memory = new Memory()

  let section: 'data' | 'text' = 'text'
  let dataPtr = MIPS_DATA_BASE

  // primeira passada: monta segmento de dados e lista linear de instruções/labels
  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1
    let line = stripComment(lines[i])
    if (!line) continue

    if (line === '.data') {
      section = 'data'
      continue
    }
    if (line === '.text') {
      section = 'text'
      continue
    }
    if (line.startsWith('.globl')) continue

    if (section === 'data') {
      const m = line.match(/^(\w+):\s*(.*)$/)
      if (!m) throw new AssemblyError(lineNo, `declaração de dado inválida: "${line}"`)
      const [, name, rest] = m
      const dm = rest.match(/^\.(\w+)\s*(.*)$/)
      if (!dm) throw new AssemblyError(lineNo, `diretiva de dado inválida: "${rest}"`)
      const [, directive, argsStr] = dm
      if (directive === 'word') {
        if (dataPtr % 4 !== 0) dataPtr += 4 - (dataPtr % 4)
        const address = dataPtr
        const values = argsStr ? splitOperands(argsStr).map(parseIntLiteral) : [0]
        for (const v of values) {
          memory.writeWord(dataPtr, v)
          dataPtr += 4
        }
        dataLabels[name] = { address, size: values.length * 4, kind: 'word' }
      } else if (directive === 'byte') {
        const address = dataPtr
        const values = splitOperands(argsStr)
        for (const raw of values) {
          const ch = raw.replace(/^'(.*)'$/, '$1')
          memory.writeByte(dataPtr, ch.length === 1 ? ch.charCodeAt(0) : parseIntLiteral(raw))
          dataPtr += 1
        }
        dataLabels[name] = { address, size: values.length, kind: 'byte' }
      } else if (directive === 'asciiz' || directive === 'ascii') {
        const str = argsStr
          .trim()
          .replace(/^"(.*)"$/, '$1')
          .replace(/\\n/g, '\n')
          .replace(/\\0/g, '\0')
        const address = dataPtr
        memory.writeString(dataPtr, str)
        dataPtr += str.length + 1
        dataLabels[name] = { address, size: str.length + 1, kind: 'asciiz' }
      } else if (directive === 'space') {
        const address = dataPtr
        const n = parseIntLiteral(argsStr)
        dataPtr += n
        dataLabels[name] = { address, size: n, kind: 'space' }
      } else {
        throw new AssemblyError(lineNo, `diretiva .${directive} não suportada`)
      }
      continue
    }

    // seção .text
    let rest = line
    const labelMatch = rest.match(/^(\w+):\s*(.*)$/)
    if (labelMatch) {
      textLabels[labelMatch[1]] = instructions.length
      rest = labelMatch[2]
      if (!rest) continue
    }

    const opMatch = rest.match(/^(\S+)\s*(.*)$/)
    if (!opMatch) throw new AssemblyError(lineNo, `instrução inválida: "${rest}"`)
    const [, opRaw, argsStr] = opMatch
    const op = opRaw.toLowerCase()
    if (!MIPS_OPS[op]) throw new AssemblyError(lineNo, `instrução MIPS desconhecida: "${opRaw}"`)
    const args = splitOperands(argsStr)
    instructions.push({ text: line, sourceLine: lineNo, op, args })
  }

  const entryIndex = textLabels['main'] ?? 0

  return { instructions, textLabels, dataLabels, initialMemory: memory, entryIndex, source }
}

export function createMipsInitialState(program: MipsProgram): MipsState {
  const registers: Record<string, number> = {}
  for (const name of MIPS_REGISTER_NAMES) registers[name] = 0
  registers['$sp'] = MIPS_INITIAL_SP
  registers['$gp'] = MIPS_INITIAL_GP
  return {
    registers,
    hi: 0,
    lo: 0,
    pc: program.entryIndex,
    memory: program.initialMemory.clone(),
    halted: program.instructions.length === 0,
    output: [],
    inputQueue: [],
  }
}

function cloneState(s: MipsState): MipsState {
  return {
    registers: { ...s.registers },
    hi: s.hi,
    lo: s.lo,
    pc: s.pc,
    memory: s.memory.clone(),
    halted: s.halted,
    output: [...s.output],
    inputQueue: [...s.inputQueue],
  }
}

/** Executa uma instrução e retorna o novo estado + o evento (para animação). */
export function stepMips(state: MipsState, program: MipsProgram): { state: MipsState; event: StepEvent } {
  if (state.halted || state.pc >= program.instructions.length) {
    return {
      state,
      event: {
        instructionIndex: state.pc,
        asmText: '',
        registersRead: [],
        registersWritten: [],
        memory: [],
        flagsWritten: [],
        aluInvolved: false,
        explanation: 'Programa encerrado.',
        halted: true,
      },
    }
  }

  const inst = program.instructions[state.pc]
  const next = cloneState(state)
  const regsRead: string[] = []
  const regsWritten: string[] = []
  const memAccess: StepEvent['memory'] = []
  let explanation = ''
  let halted = false
  let branched = false

  const R = (name: string) => {
    const n = normalizeMipsRegister(name)
    regsRead.push(n)
    return next.registers[n]
  }
  const W = (name: string, value: number) => {
    const n = normalizeMipsRegister(name)
    if (n === '$zero') return // $zero é imutável
    next.registers[n] = toI32(value)
    regsWritten.push(n)
  }
  const labelAddr = (name: string) => {
    if (program.dataLabels[name]) return program.dataLabels[name].address
    throw new Error(`rótulo desconhecido: ${name}`)
  }
  const memAddrOf = (token: string): { addr: number; label?: string } => {
    const { offset, base, label } = parseMemOperand(token)
    if (base) {
      const baseVal = R(base)
      return { addr: baseVal + offset }
    }
    if (label && program.dataLabels[label]) {
      return { addr: program.dataLabels[label].address, label }
    }
    return { addr: parseIntLiteral(label ?? '0') }
  }

  const a = inst.args

  switch (inst.op) {
    case 'add':
    case 'addu':
      W(a[0], R(a[1]) + R(a[2]))
      explanation = `${a[0]} recebe ${a[1]} + ${a[2]} (ambos lidos da CPU, resultado escrito no registrador destino).`
      break
    case 'sub':
    case 'subu':
      W(a[0], R(a[1]) - R(a[2]))
      explanation = `${a[0]} recebe ${a[1]} - ${a[2]}.`
      break
    case 'and':
      W(a[0], R(a[1]) & R(a[2]))
      explanation = `${a[0]} recebe AND bit a bit entre ${a[1]} e ${a[2]}.`
      break
    case 'or':
      W(a[0], R(a[1]) | R(a[2]))
      explanation = `${a[0]} recebe OR bit a bit entre ${a[1]} e ${a[2]}.`
      break
    case 'xor':
      W(a[0], R(a[1]) ^ R(a[2]))
      explanation = `${a[0]} recebe XOR bit a bit entre ${a[1]} e ${a[2]}.`
      break
    case 'nor':
      W(a[0], ~(R(a[1]) | R(a[2])))
      explanation = `${a[0]} recebe NOR bit a bit entre ${a[1]} e ${a[2]}.`
      break
    case 'slt':
      W(a[0], R(a[1]) < R(a[2]) ? 1 : 0)
      explanation = `${a[0]} recebe 1 se ${a[1]} < ${a[2]}, senão 0.`
      break
    case 'sltu':
      W(a[0], (R(a[1]) >>> 0) < (R(a[2]) >>> 0) ? 1 : 0)
      explanation = `${a[0]} recebe 1 se ${a[1]} < ${a[2]} (sem sinal), senão 0.`
      break
    case 'sll':
      W(a[0], R(a[1]) << parseIntLiteral(a[2]))
      explanation = `${a[0]} recebe ${a[1]} deslocado ${a[2]} bits à esquerda.`
      break
    case 'srl':
      W(a[0], R(a[1]) >>> parseIntLiteral(a[2]))
      explanation = `${a[0]} recebe ${a[1]} deslocado ${a[2]} bits à direita (lógico).`
      break
    case 'sra':
      W(a[0], R(a[1]) >> parseIntLiteral(a[2]))
      explanation = `${a[0]} recebe ${a[1]} deslocado ${a[2]} bits à direita (aritmético).`
      break
    case 'mult': {
      const r = BigInt(R(a[0])) * BigInt(R(a[1]))
      next.lo = toI32(Number(BigInt.asIntN(64, r) & 0xffffffffn))
      next.hi = toI32(Number((BigInt.asIntN(64, r) >> 32n) & 0xffffffffn))
      explanation = `Multiplica ${a[0]} × ${a[1]}; resultado de 64 bits vai para Hi:Lo.`
      break
    }
    case 'multu': {
      const r = BigInt(R(a[0]) >>> 0) * BigInt(R(a[1]) >>> 0)
      next.lo = toI32(Number(r & 0xffffffffn))
      next.hi = toI32(Number((r >> 32n) & 0xffffffffn))
      explanation = `Multiplica ${a[0]} × ${a[1]} sem sinal; resultado vai para Hi:Lo.`
      break
    }
    case 'div':
      if (R(a[1]) !== 0) {
        next.lo = toI32(Math.trunc(R(a[0]) / R(a[1])))
        next.hi = toI32(R(a[0]) % R(a[1]))
      }
      explanation = `Lo recebe o quociente e Hi o resto de ${a[0]} ÷ ${a[1]}.`
      break
    case 'divu':
      if ((R(a[1]) >>> 0) !== 0) {
        next.lo = toI32(Math.trunc((R(a[0]) >>> 0) / (R(a[1]) >>> 0)))
        next.hi = toI32((R(a[0]) >>> 0) % (R(a[1]) >>> 0))
      }
      explanation = `Divisão sem sinal: Lo=quociente, Hi=resto.`
      break
    case 'mfhi':
      W(a[0], next.hi)
      explanation = `${a[0]} recebe o valor do registrador especial Hi.`
      break
    case 'mflo':
      W(a[0], next.lo)
      explanation = `${a[0]} recebe o valor do registrador especial Lo.`
      break
    case 'jr': {
      const target = R(a[0])
      next.pc = Math.trunc((target - MIPS_TEXT_BASE) / 4)
      explanation = `Desvia para o endereço contido em ${a[0]} (retorno de sub-rotina).`
      branched = true
      break
    }

    case 'addi':
    case 'addiu':
      W(a[0], R(a[1]) + parseIntLiteral(a[2]))
      explanation = `${a[0]} recebe ${a[1]} + ${a[2]} (imediato).`
      break
    case 'andi':
      W(a[0], R(a[1]) & parseIntLiteral(a[2]))
      explanation = `${a[0]} recebe AND entre ${a[1]} e imediato ${a[2]}.`
      break
    case 'ori':
      W(a[0], R(a[1]) | parseIntLiteral(a[2]))
      explanation = `${a[0]} recebe OR entre ${a[1]} e imediato ${a[2]}.`
      break
    case 'xori':
      W(a[0], R(a[1]) ^ parseIntLiteral(a[2]))
      explanation = `${a[0]} recebe XOR entre ${a[1]} e imediato ${a[2]}.`
      break
    case 'slti':
      W(a[0], R(a[1]) < parseIntLiteral(a[2]) ? 1 : 0)
      explanation = `${a[0]} recebe 1 se ${a[1]} < ${a[2]}, senão 0.`
      break
    case 'lui':
      W(a[0], parseIntLiteral(a[1]) << 16)
      explanation = `${a[0]} recebe o imediato deslocado para os 16 bits mais altos.`
      break

    case 'lw':
    case 'lb': {
      const { addr, label } = memAddrOf(a[1])
      const value = inst.op === 'lw' ? next.memory.readWord(addr) : next.memory.readByte(addr)
      W(a[0], value)
      memAccess.push({ address: addr, size: inst.op === 'lw' ? 4 : 1, kind: 'read', label })
      explanation = `Acessa a RAM no endereço ${label ?? addr} e copia o valor para ${a[0]}. Onde estavam os dados? Na memória RAM.`
      break
    }
    case 'sw':
    case 'sb': {
      const { addr, label } = memAddrOf(a[1])
      const value = R(a[0])
      if (inst.op === 'sw') next.memory.writeWord(addr, value)
      else next.memory.writeByte(addr, value)
      memAccess.push({ address: addr, size: inst.op === 'sw' ? 4 : 1, kind: 'write', label })
      explanation = `Copia o valor de ${a[0]} da CPU para a RAM no endereço ${label ?? addr}. Onde os dados vão ficar agora? Na memória RAM.`
      break
    }
    case 'beq':
      if (R(a[0]) === R(a[1])) {
        next.pc = program.textLabels[a[2]]
        branched = true
      }
      explanation = `Compara ${a[0]} e ${a[1]}; desvia para "${a[2]}" se forem iguais.`
      break
    case 'bne':
      if (R(a[0]) !== R(a[1])) {
        next.pc = program.textLabels[a[2]]
        branched = true
      }
      explanation = `Compara ${a[0]} e ${a[1]}; desvia para "${a[2]}" se forem diferentes.`
      break

    case 'j':
      next.pc = program.textLabels[a[0]]
      branched = true
      explanation = `Desvio incondicional para "${a[0]}".`
      break
    case 'jal':
      W('$ra', mipsPcByteAddress(state.pc + 1))
      next.pc = program.textLabels[a[0]]
      branched = true
      explanation = `Salva o endereço de retorno em $ra e desvia para a sub-rotina "${a[0]}".`
      break

    // pseudo-instruções
    case 'li':
      W(a[0], parseIntLiteral(a[1]))
      explanation = `(pseudo) ${a[0]} recebe a constante ${a[1]} — o montador expande para addi/lui+ori.`
      break
    case 'la': {
      const addr = labelAddr(a[1])
      W(a[0], addr)
      explanation = `(pseudo) ${a[0]} recebe o endereço de memória do rótulo "${a[1]}" — o montador expande para lui+ori.`
      break
    }
    case 'move':
      W(a[0], R(a[1]))
      explanation = `(pseudo) copia ${a[1]} para ${a[0]} — o montador expande para "add ${a[0]}, ${a[1]}, $zero".`
      break
    case 'neg':
      W(a[0], -R(a[1]))
      explanation = `(pseudo) ${a[0]} recebe o inverso de ${a[1]}.`
      break
    case 'not':
      W(a[0], ~R(a[1]))
      explanation = `(pseudo) ${a[0]} recebe a negação bit a bit de ${a[1]}.`
      break
    case 'mul':
      W(a[0], toI32(R(a[1]) * R(a[2])))
      explanation = `(pseudo) ${a[0]} recebe ${a[1]} × ${a[2]} — o montador expande para mult+mflo.`
      break
    case 'b':
      next.pc = program.textLabels[a[0]]
      branched = true
      explanation = `(pseudo) desvio incondicional para "${a[0]}".`
      break
    case 'blt':
      if (R(a[0]) < R(a[1])) {
        next.pc = program.textLabels[a[2]]
        branched = true
      }
      explanation = `(pseudo) desvia para "${a[2]}" se ${a[0]} < ${a[1]}.`
      break
    case 'ble':
      if (R(a[0]) <= R(a[1])) {
        next.pc = program.textLabels[a[2]]
        branched = true
      }
      explanation = `(pseudo) desvia para "${a[2]}" se ${a[0]} <= ${a[1]}.`
      break
    case 'bgt':
      if (R(a[0]) > R(a[1])) {
        next.pc = program.textLabels[a[2]]
        branched = true
      }
      explanation = `(pseudo) desvia para "${a[2]}" se ${a[0]} > ${a[1]}.`
      break
    case 'bge':
      if (R(a[0]) >= R(a[1])) {
        next.pc = program.textLabels[a[2]]
        branched = true
      }
      explanation = `(pseudo) desvia para "${a[2]}" se ${a[0]} >= ${a[1]}.`
      break

    case 'syscall': {
      const code = R('$v0')
      if (code === 1) {
        next.output.push(String(R('$a0')))
        explanation = `syscall 1: imprime o inteiro em $a0 (${next.registers['$a0']}).`
      } else if (code === 4) {
        const addr = R('$a0')
        next.output.push(next.memory.readString(addr))
        explanation = `syscall 4: imprime a string cujo endereço está em $a0.`
      } else if (code === 5) {
        const v = next.inputQueue.shift() ?? 0
        W('$v0', v)
        explanation = `syscall 5: lê um inteiro da entrada e guarda em $v0.`
      } else if (code === 10) {
        halted = true
        explanation = `syscall 10: encerra o programa.`
      } else {
        explanation = `syscall ${code} (não simulada).`
      }
      break
    }

    default:
      throw new Error(`instrução não implementada: ${inst.op}`)
  }

  if (!branched) next.pc = state.pc + 1
  if (next.pc >= program.instructions.length || next.pc < 0) halted = true
  next.halted = halted

  const event: StepEvent = {
    instructionIndex: state.pc,
    asmText: inst.text,
    registersRead: Array.from(new Set(regsRead)),
    registersWritten: Array.from(new Set(regsWritten)),
    memory: memAccess,
    flagsWritten: [],
    aluInvolved: ALU_INVOLVED_MIPS.has(inst.op),
    explanation,
    halted,
  }

  return { state: next, event }
}

export function mipsPcByteAddress(pc: number): number {
  return MIPS_TEXT_BASE + pc * 4
}

export { MIPS_OPS as __MIPS_OPS_FOR_TESTS }
