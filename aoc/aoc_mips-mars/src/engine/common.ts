// Tipos e utilidades compartilhados pelos dois interpretadores (IA-32 e MIPS).
// Cada interpretador é "real": assembla um texto em instruções decodificadas
// e executa passo a passo, produzindo um novo estado imutável a cada passo.

export type MemAccess = {
  address: number
  size: 1 | 2 | 4
  kind: 'read' | 'write'
  /** rótulo/variável associado ao endereço, quando conhecido */
  label?: string
}

/** O que aconteceu num único passo de execução — usado para animar o data-path. */
export interface StepEvent {
  /** índice da instrução (posição na lista de instruções) antes do passo */
  instructionIndex: number
  /** texto assembly da instrução executada */
  asmText: string
  registersRead: string[]
  registersWritten: string[]
  memory: MemAccess[]
  flagsWritten: string[]
  /** true apenas quando a ALU de fato realizou um cálculo aritmético/lógico
   * (não em simples movimentação de dado, como mov/li/lw/sw) */
  aluInvolved: boolean
  /** narrativa curta em pt-BR: onde estão os dados, o que mudou */
  explanation: string
  /** true quando o programa terminou (syscall exit, ret da main, etc.) */
  halted: boolean
}

export function toI32(n: number): number {
  return n | 0
}

export function hex(n: number, width = 8): string {
  const u = n >>> 0
  return '0x' + u.toString(16).padStart(width, '0')
}

export function formatAddress(n: number): string {
  return hex(n, 8)
}

/** Memória byte-endereçável simplificada: palavras (.word / lw / sw) guardadas
 * em endereços múltiplos de 4; bytes individuais (.byte/.asciiz) num mapa à parte. */
export class Memory {
  words: Map<number, number>
  bytes: Map<number, number>

  constructor(words?: Map<number, number>, bytes?: Map<number, number>) {
    this.words = words ?? new Map()
    this.bytes = bytes ?? new Map()
  }

  clone(): Memory {
    return new Memory(new Map(this.words), new Map(this.bytes))
  }

  readWord(addr: number): number {
    return toI32(this.words.get(addr) ?? 0)
  }

  writeWord(addr: number, value: number) {
    this.words.set(addr, toI32(value))
  }

  readByte(addr: number): number {
    return this.bytes.get(addr) ?? 0
  }

  writeByte(addr: number, value: number) {
    this.bytes.set(addr, value & 0xff)
  }

  writeString(addr: number, str: string) {
    let a = addr
    for (const ch of str) {
      this.bytes.set(a, ch.charCodeAt(0) & 0xff)
      a += 1
    }
    this.bytes.set(a, 0)
  }

  readString(addr: number): string {
    let a = addr
    let s = ''
    let guard = 0
    while (guard++ < 4096) {
      const b = this.bytes.get(a) ?? 0
      if (b === 0) break
      s += String.fromCharCode(b)
      a += 1
    }
    return s
  }
}

export interface AssembleError {
  line: number
  message: string
}

export class AssemblyError extends Error {
  line: number
  constructor(line: number, message: string) {
    super(`Linha ${line}: ${message}`)
    this.line = line
  }
}

/** Remove comentários e espaços supérfluos de uma linha de assembly. */
export function stripComment(line: string, commentChar = '#'): string {
  const idx = line.indexOf(commentChar)
  return (idx === -1 ? line : line.slice(0, idx)).trim()
}

export function splitOperands(s: string): string[] {
  if (!s.trim()) return []
  return s.split(',').map((x) => x.trim())
}
