export interface QuizQuestion {
  question: string
  options: { text: string; correct?: boolean }[]
  explanation: string
}

export const QUIZZES: Record<string, QuizQuestion[]> = {
  soma: [
    {
      question: 'Qual registrador MIPS contém o resultado de c = a + b?',
      options: [{ text: '$t0', correct: true }, { text: '$s0' }, { text: '$s1' }, { text: '$v0' }],
      explanation: '$t0 é o operando destino explícito em "add $t0, $s0, $s1" — o formato de 3 operandos do MIPS deixa isso claro.',
    },
    {
      question: 'Alguma instrução deste exemplo acessou a memória RAM?',
      options: [{ text: 'Não — tudo aconteceu entre registradores e ALU', correct: true }, { text: 'Sim, ao carregar a e b' }, { text: 'Sim, ao gravar c' }],
      explanation: 'Não há lw/sw (MIPS) nem mov [...] (IA-32): a, b e c inteiros pequenos vivem só em registradores durante o cálculo.',
    },
    {
      question: 'IA-32 soma com 2 operandos (ADD EAX, EBX) e MIPS com 3 (add $t0, $s0, $s1). Isso pertence a...',
      options: [{ text: 'à ISA — é o formato de instrução definido por cada arquitetura', correct: true }, { text: 'à microarquitetura do Pentium 4' }],
      explanation: 'O número e a ordem dos operandos fazem parte da especificação da ISA (o "contrato"), não da implementação física.',
    },
  ],
  vetor: [
    {
      question: 'Qual instrução MIPS foi necessária só para calcular o deslocamento do índice (i × 4), sem equivalente direto na versão IA-32?',
      options: [{ text: 'sll (deslocamento à esquerda)', correct: true }, { text: 'lw' }, { text: 'la' }, { text: 'sw' }],
      explanation: 'O IA-32 calcula índice×escala dentro do próprio modo de endereçamento do MOV ([v+ecx*4]); o MIPS não tem esse recurso e precisa de um sll explícito antes de somar ao endereço base.',
    },
    {
      question: 'Qual instrução realizou, de fato, a escrita na RAM em v[i] = 10?',
      options: [{ text: 'sw (MIPS) / mov [...] (IA-32)', correct: true }, { text: 'la (MIPS) / lea (IA-32)' }, { text: 'li (MIPS) / mov eax,10 (IA-32)' }],
      explanation: 'sw e mov [v+ecx*4], eax são as únicas instruções que tocam a memória; as demais só preparam valores em registradores.',
    },
    {
      question: 'O que mudou de concreto ao trocar IA-32 por MIPS neste exemplo?',
      options: [
        { text: 'O MIPS precisou de mais instruções, pois não tem endereçamento indexado com escala embutido', correct: true },
        { text: 'Nada mudou, o código ficou idêntico' },
        { text: 'O MIPS usou menos instruções que o IA-32' },
      ],
      explanation: 'Contar instruções é uma forma concreta (não um rótulo abstrato "CISC×RISC") de ver a diferença de filosofia entre as duas ISAs.',
    },
  ],
  funcao: [
    {
      question: 'Onde ficam os argumentos da função soma(4, 7) na versão IA-32?',
      options: [{ text: 'Na pilha, em RAM (via PUSH)', correct: true }, { text: 'Em $a0 e $a1' }, { text: 'Só em EAX' }],
      explanation: 'A convenção cdecl usada aqui empilha os argumentos com PUSH antes do CALL — eles passam pela RAM.',
    },
    {
      question: 'E na versão MIPS?',
      options: [{ text: 'Em registradores $a0/$a1, sem tocar a RAM', correct: true }, { text: 'Também na pilha' }, { text: 'Em $v0' }],
      explanation: 'A convenção de chamada do MIPS reserva $a0-$a3 para os primeiros argumentos — mais rápido, sem acesso à memória.',
    },
    {
      question: 'Essa diferença (pilha vs. registradores para argumentos) pertence a...',
      options: [
        { text: 'uma convenção de chamada adotada sobre a ISA (a ISA permitiria outras escolhas)', correct: true },
        { text: 'uma regra física obrigatória do hardware, sem alternativa possível' },
      ],
      explanation: 'A ISA fornece os registradores e instruções; COMO usá-los para passar argumentos é uma convenção (ABI) definida pelo compilador/sistema, não uma imposição física.',
    },
  ],
}
