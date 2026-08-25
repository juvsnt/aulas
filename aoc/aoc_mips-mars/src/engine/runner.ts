// Adaptador comum para os dois interpretadores, permitindo que a mesma UI
// (stepper, tabela de registradores, memória) sirva tanto para IA-32 quanto
// para MIPS — inclusive lado a lado no comparador.

import type { Memory, StepEvent } from './common'
import { assembleIa32, createIa32InitialState, ia32EipByteAddress, stepIa32, type Ia32Program, type Ia32State } from './ia32'
import { assembleMips, createMipsInitialState, mipsPcByteAddress, stepMips, type MipsProgram, type MipsState } from './mips'
import { MIPS_REGISTER_INFO } from './mipsRegisters'
import { IA32_REGISTERS } from './ia32'

export type IsaId = 'ia32' | 'mips'

export interface IsaAdapter<TProgram = unknown, TState = unknown> {
  id: IsaId
  label: string
  registerOrder: string[]
  assemble(source: string): TProgram
  createInitial(program: TProgram): TState
  step(state: TState, program: TProgram): { state: TState; event: StepEvent }
  getPc(state: TState): number
  byteAddressOfPc(pc: number): number
  getRegisters(state: TState): Record<string, number>
  getFlags(state: TState): Record<string, boolean> | null
  getMemory(state: TState): Memory
  getOutput(state: TState): string[]
  isHalted(state: TState): boolean
  instructionCount(program: TProgram): number
  getSourceLine(program: TProgram, pc: number): number | undefined
  getDataLabels(program: TProgram): Record<string, { address: number; size: number }>
}

export const ia32Adapter: IsaAdapter<Ia32Program, Ia32State> = {
  id: 'ia32',
  label: 'IA-32 / x86 (32 bits)',
  registerOrder: [...IA32_REGISTERS],
  assemble: assembleIa32,
  createInitial: createIa32InitialState,
  step: stepIa32,
  getPc: (s) => s.eip,
  byteAddressOfPc: ia32EipByteAddress,
  getRegisters: (s) => s.registers,
  getFlags: (s) => s.flags as unknown as Record<string, boolean>,
  getMemory: (s) => s.memory,
  getOutput: (s) => s.output,
  isHalted: (s) => s.halted,
  instructionCount: (p) => p.instructions.length,
  getSourceLine: (p, pc) => p.instructions[pc]?.sourceLine,
  getDataLabels: (p) => p.dataLabels,
}

export const mipsAdapter: IsaAdapter<MipsProgram, MipsState> = {
  id: 'mips',
  label: 'MIPS32',
  registerOrder: MIPS_REGISTER_INFO.map((r) => r.name),
  assemble: assembleMips,
  createInitial: createMipsInitialState,
  step: stepMips,
  getPc: (s) => s.pc,
  byteAddressOfPc: mipsPcByteAddress,
  getRegisters: (s) => s.registers,
  getFlags: () => null,
  getMemory: (s) => s.memory,
  getOutput: (s) => s.output,
  isHalted: (s) => s.halted,
  instructionCount: (p) => p.instructions.length,
  getSourceLine: (p, pc) => p.instructions[pc]?.sourceLine,
  getDataLabels: (p) => p.dataLabels,
}

export function adapterFor(id: IsaId): IsaAdapter<any, any> {
  return id === 'ia32' ? ia32Adapter : mipsAdapter
}
