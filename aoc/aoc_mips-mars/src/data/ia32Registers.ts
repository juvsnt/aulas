export interface Ia32RegisterInfo {
  name: string
  historicalName: string
  use: string
}

// Papel clássico de cada registrador de propósito geral do IA-32 (32 bits).
// Todos continuam utilizáveis como registradores genéricos; os nomes
// históricos indicam o uso predominante em código gerado por compiladores
// e nas convenções de chamada.
export const IA32_REGISTER_INFO: Ia32RegisterInfo[] = [
  { name: 'EAX', historicalName: 'accumulator', use: 'Acumulador; convenção para valor de retorno de funções.' },
  { name: 'EBX', historicalName: 'base', use: 'Registrador base; historicamente usado para endereçar dados.' },
  { name: 'ECX', historicalName: 'counter', use: 'Contador; usado por instruções de repetição/deslocamento.' },
  { name: 'EDX', historicalName: 'data', use: 'Dados; usado junto com EAX em multiplicação/divisão de 64 bits.' },
  { name: 'ESI', historicalName: 'source index', use: 'Índice de origem em operações que percorrem blocos de memória.' },
  { name: 'EDI', historicalName: 'destination index', use: 'Índice de destino em operações que percorrem blocos de memória.' },
  { name: 'ESP', historicalName: 'stack pointer', use: 'Aponta para o topo da pilha (RAM). Alterado por PUSH/POP/CALL/RET.' },
  { name: 'EBP', historicalName: 'base pointer', use: 'Aponta para a base do quadro de pilha da função atual.' },
  { name: 'EIP', historicalName: 'instruction pointer', use: 'Endereço da próxima instrução a ser buscada — não é acessível diretamente por MOV.' },
]

export const IA32_FLAG_INFO = [
  { name: 'ZF', use: 'Zero Flag: 1 quando o resultado da última operação foi zero.' },
  { name: 'SF', use: 'Sign Flag: reflete o bit de sinal (bit 31) do resultado.' },
  { name: 'OF', use: 'Overflow Flag: 1 quando houve estouro aritmético com sinal.' },
  { name: 'CF', use: 'Carry Flag: 1 quando houve "vai um"/empréstimo na aritmética sem sinal.' },
]
