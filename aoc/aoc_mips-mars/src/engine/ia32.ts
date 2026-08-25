// Interpretador real (subconjunto) de IA-32/x86 de 32 bits, sintaxe Intel,
// pensado para acompanhar pedagogicamente um Pentium 4 (registradores de 32
// bits: EAX, EBX, ECX, EDX, ESI, EDI, ESP, EBP, EIP + flags ZF, SF, OF, CF).

import { AssemblyError, Memory, splitOperands, stripComment, toI32, type StepEvent } from './common'

export const IA32_TEXT_BASE = 0x00401000
export const IA32_DATA_BASE = 0x00404000
export const IA32_INITIAL_ESP = 0x0012ffc0

// Instruções cujo cálculo de fato passa pela ALU. MOV/LEA/PUSH/POP/CALL/RET/
// desvios são movimentação de dado ou controle de fluxo, não usam a ALU para
// computar um resultado (LEA usa a unidade de geração de endereço, à parte).
const ALU_INVOLVED_IA32 = new Set(['add', 'sub', 'cmp', 'inc', 'dec', 'neg', 'and', 'or', 'xor', 'imul'])

export const IA32_REGISTERS = ['EAX', 'EBX', 'ECX', 'EDX', 'ESI', 'EDI', 'EBP', 'ESP'] as const
export type Ia32Register = (typeof IA32_REGISTERS)[number]

export interface Ia32Flags {
  ZF: boolean
  SF: boolean
  OF: boolean
  CF: boolean
}

export type Ia32OperandKind = 'reg' | 'imm' | 'mem' | 'label'

export interface Ia32Instruction {
  text: string
  sourceLine: number
  op: string
  args: string[]
}

export interface Ia32DataLabel {
  address: number
  size: number
  count: number
}

export interface Ia32Program {
  instructions: Ia32Instruction[]
  textLabels: Record<string, number>
  dataLabels: Record<string, Ia32DataLabel>
  initialMemory: Memory
  entryIndex: number
  source: string
}

export interface Ia32State {
  registers: Record<Ia32Register, number>
  eip: number // índice da instrução
  flags: Ia32Flags
  memory: Memory
  halted: boolean
  output: string[]
}

function parseIntLiteral(tok: string): number {
  const t = tok.trim()
  if (/^0x[0-9a-fA-F]+$/.test(t)) return parseInt(t, 16)
  if (/^-?\d+$/.test(t)) return parseInt(t, 10)
  throw new Error(`Valor numérico inválido: ${tok}`)
}

function isRegister(tok: string): tok is Ia32Register {
  return (IA32_REGISTERS as readonly string[]).includes(tok.toUpperCase())
}

export function assembleIa32(source: string): Ia32Program {
  const lines = source.split('\n')
  const instructions: Ia32Instruction[] = []
  const textLabels: Record<string, number> = {}
  const dataLabels: Record<string, Ia32DataLabel> = {}
  const memory = new Memory()

  let section: 'data' | 'text' = 'text'
  let dataPtr = IA32_DATA_BASE

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1
    let line = stripComment(lines[i], ';')
    line = stripComment(line, '#')
    if (!line) continue

    if (line === '.data' || line === 'section .data') {
      section = 'data'
      continue
    }
    if (line === '.text' || line === 'section .text') {
      section = 'text'
      continue
    }

    if (section === 'data') {
      const m = line.match(/^(\w+):\s*dd\s+(.*)$/i)
      if (!m) throw new AssemblyError(lineNo, `declaração de dado inválida: "${line}"`)
      const [, name, argsStr] = m
      const values = splitOperands(argsStr).map(parseIntLiteral)
      const address = dataPtr
      for (const v of values) {
        memory.writeWord(dataPtr, v)
        dataPtr += 4
      }
      dataLabels[name] = { address, size: values.length * 4, count: values.length }
      continue
    }

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
    const args = splitOperands(argsStr)
    instructions.push({ text: line, sourceLine: lineNo, op, args })
  }

  const entryIndex = textLabels['main'] ?? textLabels['_start'] ?? 0
  return { instructions, textLabels, dataLabels, initialMemory: memory, entryIndex, source }
}

export function createIa32InitialState(program: Ia32Program): Ia32State {
  const registers = Object.fromEntries(IA32_REGISTERS.map((r) => [r, 0])) as Record<Ia32Register, number>
  registers.ESP = IA32_INITIAL_ESP
  registers.EBP = IA32_INITIAL_ESP
  return {
    registers,
    eip: program.entryIndex,
    flags: { ZF: false, SF: false, OF: false, CF: false },
    memory: program.initialMemory.clone(),
    halted: program.instructions.length === 0,
    output: [],
  }
}

function cloneState(s: Ia32State): Ia32State {
  return {
    registers: { ...s.registers },
    eip: s.eip,
    flags: { ...s.flags },
    memory: s.memory.clone(),
    halted: s.halted,
    output: [...s.output],
  }
}

interface ResolvedMem {
  address: number
  label?: string
  regsTouched: string[]
}

function resolveMemOperand(inner: string, program: Ia32Program, regs: Record<Ia32Register, number>): ResolvedMem {
  const norm = inner.replace(/\s+/g, '')
  const terms = norm.replace(/-/g, '+-').split('+').filter((t) => t.length > 0)
  let address = 0
  const regsTouched: string[] = []
  let label: string | undefined
  for (const term of terms) {
    const scaled = term.match(/^(\w+)\*(\d+)$/)
    if (scaled && isRegister(scaled[1])) {
      const r = scaled[1].toUpperCase() as Ia32Register
      regsTouched.push(r)
      address += regs[r] * Number(scaled[2])
      continue
    }
    if (isRegister(term)) {
      const r = term.toUpperCase() as Ia32Register
      regsTouched.push(r)
      address += regs[r]
      continue
    }
    if (program.dataLabels[term]) {
      label = term
      address += program.dataLabels[term].address
      continue
    }
    address += parseIntLiteral(term)
  }
  return { address, label, regsTouched }
}

function addFlags(a: number, b: number, result: number): Ia32Flags {
  const CF = (a >>> 0) + (b >>> 0) > 0xffffffff
  const OF = ((~(a ^ b) & (a ^ result)) >>> 31) === 1
  return { ZF: result === 0, SF: result < 0, OF, CF }
}

function subFlags(a: number, b: number, result: number): Ia32Flags {
  const CF = (a >>> 0) < (b >>> 0)
  const OF = (((a ^ b) & (a ^ result)) >>> 31) === 1
  return { ZF: result === 0, SF: result < 0, OF, CF }
}

export function stepIa32(state: Ia32State, program: Ia32Program): { state: Ia32State; event: StepEvent } {
  if (state.halted || state.eip >= program.instructions.length) {
    return {
      state,
      event: {
        instructionIndex: state.eip,
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

  const inst = program.instructions[state.eip]
  const next = cloneState(state)
  const regsRead: string[] = []
  const regsWritten: string[] = []
  const memAccess: StepEvent['memory'] = []
  const flagsWritten: string[] = []
  let explanation = ''
  let halted = false
  let jumped = false

  const readOperand = (tok: string): number => {
    const t = tok.trim()
    const memMatch = t.match(/^\[(.+)\]$/)
    if (memMatch) {
      const { address, label, regsTouched } = resolveMemOperand(memMatch[1], program, next.registers)
      regsRead.push(...regsTouched)
      const value = next.memory.readWord(address)
      memAccess.push({ address, size: 4, kind: 'read', label })
      return value
    }
    if (isRegister(t)) {
      const r = t.toUpperCase() as Ia32Register
      regsRead.push(r)
      return next.registers[r]
    }
    // convenção NASM: um rótulo "nu" (sem colchetes) é seu ENDEREÇO,
    // equivalente a "lea reg, [rotulo]" — [rotulo] é que acessa o valor.
    if (program.dataLabels[t]) return program.dataLabels[t].address
    return parseIntLiteral(t)
  }

  const writeOperand = (tok: string, value: number) => {
    const t = tok.trim()
    const memMatch = t.match(/^\[(.+)\]$/)
    if (memMatch) {
      const { address, label, regsTouched } = resolveMemOperand(memMatch[1], program, next.registers)
      regsRead.push(...regsTouched)
      next.memory.writeWord(address, value)
      memAccess.push({ address, size: 4, kind: 'write', label })
      return
    }
    if (isRegister(t)) {
      const r = t.toUpperCase() as Ia32Register
      next.registers[r] = toI32(value)
      regsWritten.push(r)
      return
    }
    throw new Error(`destino inválido: ${tok}`)
  }

  const applyFlags = (f: Ia32Flags) => {
    next.flags = f
    flagsWritten.push('ZF', 'SF', 'OF', 'CF')
  }

  const a = inst.args

  switch (inst.op) {
    case 'mov':
      writeOperand(a[0], readOperand(a[1]))
      explanation = `${a[0]} recebe o valor de ${a[1]}. Onde os dados estavam? ${
        a[1].startsWith('[') ? 'na memória RAM.' : /^-?\d+$/.test(a[1]) ? 'era um valor imediato, embutido na instrução.' : 'em outro registrador da CPU.'
      }`
      break
    case 'lea': {
      const memMatch = a[1].match(/^\[(.+)\]$/)
      if (!memMatch) throw new Error('lea espera operando de memória')
      const { address, regsTouched } = resolveMemOperand(memMatch[1], program, next.registers)
      regsRead.push(...regsTouched)
      writeOperand(a[0], address)
      explanation = `${a[0]} recebe o endereço calculado ${a[1]} (sem acessar a RAM — só a ALU calcula o endereço).`
      break
    }
    case 'add': {
      const x = readOperand(a[0])
      const y = readOperand(a[1])
      const r = toI32(x + y)
      writeOperand(a[0], r)
      applyFlags(addFlags(x, y, r))
      explanation = `${a[0]} = ${a[0]} + ${a[1]} = ${r}. Flags atualizadas conforme o resultado.`
      break
    }
    case 'sub': {
      const x = readOperand(a[0])
      const y = readOperand(a[1])
      const r = toI32(x - y)
      writeOperand(a[0], r)
      applyFlags(subFlags(x, y, r))
      explanation = `${a[0]} = ${a[0]} - ${a[1]} = ${r}. Flags atualizadas conforme o resultado.`
      break
    }
    case 'cmp': {
      const x = readOperand(a[0])
      const y = readOperand(a[1])
      const r = toI32(x - y)
      applyFlags(subFlags(x, y, r))
      explanation = `Calcula ${a[0]} - ${a[1]} apenas para setar as flags (não altera ${a[0]}). ZF=${next.flags.ZF}, SF=${next.flags.SF}.`
      break
    }
    case 'inc': {
      const x = readOperand(a[0])
      const r = toI32(x + 1)
      writeOperand(a[0], r)
      applyFlags(addFlags(x, 1, r))
      explanation = `${a[0]} incrementado em 1.`
      break
    }
    case 'dec': {
      const x = readOperand(a[0])
      const r = toI32(x - 1)
      writeOperand(a[0], r)
      applyFlags(subFlags(x, 1, r))
      explanation = `${a[0]} decrementado em 1.`
      break
    }
    case 'neg': {
      const x = readOperand(a[0])
      const r = toI32(-x)
      writeOperand(a[0], r)
      applyFlags(subFlags(0, x, r))
      explanation = `${a[0]} recebe seu valor invertido (complemento de dois).`
      break
    }
    case 'and': {
      const x = readOperand(a[0])
      const y = readOperand(a[1])
      const r = toI32(x & y)
      writeOperand(a[0], r)
      applyFlags({ ZF: r === 0, SF: r < 0, OF: false, CF: false })
      explanation = `${a[0]} = ${a[0]} AND ${a[1]}.`
      break
    }
    case 'or': {
      const x = readOperand(a[0])
      const y = readOperand(a[1])
      const r = toI32(x | y)
      writeOperand(a[0], r)
      applyFlags({ ZF: r === 0, SF: r < 0, OF: false, CF: false })
      explanation = `${a[0]} = ${a[0]} OR ${a[1]}.`
      break
    }
    case 'xor': {
      const x = readOperand(a[0])
      const y = readOperand(a[1])
      const r = toI32(x ^ y)
      writeOperand(a[0], r)
      applyFlags({ ZF: r === 0, SF: r < 0, OF: false, CF: false })
      explanation = `${a[0]} = ${a[0]} XOR ${a[1]}.`
      break
    }
    case 'imul': {
      const x = readOperand(a[0])
      const y = readOperand(a[1])
      const r = toI32(x * y)
      writeOperand(a[0], r)
      explanation = `${a[0]} = ${a[0]} × ${a[1]} = ${r}.`
      break
    }
    case 'push': {
      const v = readOperand(a[0])
      next.registers.ESP = toI32(next.registers.ESP - 4)
      next.memory.writeWord(next.registers.ESP, v)
      regsWritten.push('ESP')
      memAccess.push({ address: next.registers.ESP, size: 4, kind: 'write', label: 'pilha' })
      explanation = `Empilha ${a[0]}: ESP -= 4, depois grava o valor no topo da pilha (RAM).`
      break
    }
    case 'pop': {
      const v = next.memory.readWord(next.registers.ESP)
      memAccess.push({ address: next.registers.ESP, size: 4, kind: 'read', label: 'pilha' })
      regsRead.push('ESP')
      writeOperand(a[0], v)
      next.registers.ESP = toI32(next.registers.ESP + 4)
      regsWritten.push('ESP')
      explanation = `Desempilha para ${a[0]}: lê o topo da pilha (RAM) e depois ESP += 4.`
      break
    }
    case 'call': {
      next.registers.ESP = toI32(next.registers.ESP - 4)
      next.memory.writeWord(next.registers.ESP, IA32_TEXT_BASE + (state.eip + 1) * 4)
      regsWritten.push('ESP')
      memAccess.push({ address: next.registers.ESP, size: 4, kind: 'write', label: 'pilha (retorno)' })
      next.eip = program.textLabels[a[0]]
      jumped = true
      explanation = `Empilha o endereço de retorno e desvia para a função "${a[0]}".`
      break
    }
    case 'ret': {
      const ret = next.memory.readWord(next.registers.ESP)
      memAccess.push({ address: next.registers.ESP, size: 4, kind: 'read', label: 'pilha (retorno)' })
      next.registers.ESP = toI32(next.registers.ESP + 4)
      regsWritten.push('ESP')
      next.eip = Math.trunc((ret - IA32_TEXT_BASE) / 4)
      jumped = true
      explanation = `Desempilha o endereço de retorno e volta para o chamador.`
      break
    }
    case 'jmp':
      next.eip = program.textLabels[a[0]]
      jumped = true
      explanation = `Desvio incondicional para "${a[0]}".`
      break
    case 'je':
    case 'jz':
      if (state.flags.ZF) {
        next.eip = program.textLabels[a[0]]
        jumped = true
      }
      explanation = `Desvia para "${a[0]}" se ZF=1 (igualdade).`
      break
    case 'jne':
    case 'jnz':
      if (!state.flags.ZF) {
        next.eip = program.textLabels[a[0]]
        jumped = true
      }
      explanation = `Desvia para "${a[0]}" se ZF=0 (diferença).`
      break
    case 'jg':
    case 'jnle':
      if (!state.flags.ZF && state.flags.SF === state.flags.OF) {
        next.eip = program.textLabels[a[0]]
        jumped = true
      }
      explanation = `Desvia para "${a[0]}" se maior (com sinal).`
      break
    case 'jge':
    case 'jnl':
      if (state.flags.SF === state.flags.OF) {
        next.eip = program.textLabels[a[0]]
        jumped = true
      }
      explanation = `Desvia para "${a[0]}" se maior ou igual (com sinal).`
      break
    case 'jl':
    case 'jnge':
      if (state.flags.SF !== state.flags.OF) {
        next.eip = program.textLabels[a[0]]
        jumped = true
      }
      explanation = `Desvia para "${a[0]}" se menor (com sinal).`
      break
    case 'jle':
    case 'jng':
      if (state.flags.ZF || state.flags.SF !== state.flags.OF) {
        next.eip = program.textLabels[a[0]]
        jumped = true
      }
      explanation = `Desvia para "${a[0]}" se menor ou igual (com sinal).`
      break
    case 'nop':
      explanation = 'Nenhuma operação.'
      break

    default:
      throw new Error(`instrução não implementada: ${inst.op}`)
  }

  if (!jumped) next.eip = state.eip + 1
  if (next.eip >= program.instructions.length || next.eip < 0) halted = true
  next.halted = halted

  const event: StepEvent = {
    instructionIndex: state.eip,
    asmText: inst.text,
    registersRead: Array.from(new Set(regsRead)),
    registersWritten: Array.from(new Set(regsWritten)),
    memory: memAccess,
    flagsWritten: Array.from(new Set(flagsWritten)),
    aluInvolved: ALU_INVOLVED_IA32.has(inst.op),
    explanation,
    halted,
  }

  return { state: next, event }
}

export function ia32EipByteAddress(eip: number): number {
  return IA32_TEXT_BASE + eip * 4
}
