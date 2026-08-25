import { assembleMips, createMipsInitialState, stepMips } from '../src/engine/mips'
import { assembleIa32, createIa32InitialState, stepIa32 } from '../src/engine/ia32'
import { MICRO_EXAMPLES } from '../src/data/examples'

let failures = 0

for (const ex of MICRO_EXAMPLES) {
  try {
    const prog = assembleMips(ex.mips.asm)
    let state = createMipsInitialState(prog)
    let guard = 0
    const trace: string[] = []
    while (!state.halted && guard++ < 200) {
      const { state: next, event } = stepMips(state, prog)
      trace.push(event.asmText || '(halt)')
      state = next
    }
    console.log(`[MIPS  ] ${ex.id.padEnd(12)} OK  passos=${trace.length}  regs=${JSON.stringify(state.registers)}`)
  } catch (e) {
    failures++
    console.error(`[MIPS  ] ${ex.id.padEnd(12)} FALHOU:`, (e as Error).message)
  }

  try {
    const prog = assembleIa32(ex.ia32.asm)
    let state = createIa32InitialState(prog)
    let guard = 0
    const trace: string[] = []
    while (!state.halted && guard++ < 200) {
      const { state: next, event } = stepIa32(state, prog)
      trace.push(event.asmText || '(halt)')
      state = next
    }
    console.log(`[IA32  ] ${ex.id.padEnd(12)} OK  passos=${trace.length}  regs=${JSON.stringify(state.registers)} flags=${JSON.stringify(state.flags)}`)
  } catch (e) {
    failures++
    console.error(`[IA32  ] ${ex.id.padEnd(12)} FALHOU:`, (e as Error).message)
  }
}

if (failures > 0) {
  console.error(`\n${failures} falha(s).`)
  process.exit(1)
} else {
  console.log('\nTodos os exemplos assemblados e executados sem erro.')
}
