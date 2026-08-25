// Os 10 microprogramas progressivos pedidos nas instruções da aula.
// Cada exemplo traz: código C mínimo, assembly IA-32 (Intel, 32 bits) e
// assembly MIPS (compatível com MARS), ambos executáveis pelos
// interpretadores em src/engine. Os mapas de variáveis documentam a
// convenção de registradores usada (espelhando o estilo do material da
// disciplina: variáveis "fonte" em $s, temporários em $t).

export interface MicroExample {
  id: string
  order: number
  title: string
  cCode: string
  concept: string
  ia32: { asm: string; variableMap: Record<string, string> }
  mips: { asm: string; variableMap: Record<string, string> }
  /** pergunta-guia central deste exemplo (seção "onde estão os dados?") */
  guidingQuestion: string
}

export const MICRO_EXAMPLES: MicroExample[] = [
  {
    id: 'return',
    order: 1,
    title: '1. return 10;',
    cCode: `int main() {\n    return 10;\n}`,
    concept:
      'O valor de retorno de uma função não vai para a memória: fica em um registrador combinado (EAX no IA-32, $v0 no MIPS). É a convenção de chamada da ISA, não uma regra do C.',
    guidingQuestion: 'Onde fica o valor de retorno de uma função — em memória ou em um registrador?',
    ia32: {
      asm: `.text\nmain:\n    mov eax, 10`,
      variableMap: { 'valor de retorno': 'EAX' },
    },
    mips: {
      asm: `.text\nmain:\n    li $v0, 10\n    jr $ra`,
      variableMap: { 'valor de retorno': '$v0' },
    },
  },
  {
    id: 'atribuicao',
    order: 2,
    title: '2. Atribuição de valor',
    cCode: `int x;\nx = 5;`,
    concept:
      'Uma atribuição de constante a uma variável local vira um único MOV/LI: a "variável" x, enquanto está ativa em um cálculo, mora num registrador — não em uma posição fixa de memória.',
    guidingQuestion: 'A variável x nunca tocou a RAM. Onde ela está fisicamente enquanto o programa roda?',
    ia32: {
      asm: `.text\nmain:\n    mov eax, 5`,
      variableMap: { x: 'EAX' },
    },
    mips: {
      asm: `.text\nmain:\n    li $t0, 5`,
      variableMap: { x: '$t0' },
    },
  },
  {
    id: 'soma',
    order: 3,
    title: '3. Soma',
    cCode: `int a = 12, b = 30, c;\nc = a + b;`,
    concept:
      'Duas cargas de constantes seguidas de uma soma de registrador-registrador. O IA-32 é de 2 operandos (destino também é fonte); o MIPS é de 3 operandos (destino separado das fontes).',
    guidingQuestion: 'Quantas instruções cada ISA precisou para a mesma soma? Os operandos aparecem na mesma ordem?',
    ia32: {
      asm: `.text\nmain:\n    mov eax, 12  ; a\n    mov ebx, 30  ; b\n    add eax, ebx ; c = a + b (fica em EAX)`,
      variableMap: { a: 'EAX', b: 'EBX', c: 'EAX (sobrescrito)' },
    },
    mips: {
      asm: `.text\nmain:\n    li $s0, 12         # a\n    li $s1, 30         # b\n    add $t0, $s0, $s1  # c = a + b`,
      variableMap: { a: '$s0', b: '$s1', c: '$t0' },
    },
  },
  {
    id: 'subtracao',
    order: 4,
    title: '4. Subtração',
    cCode: `int a = 20, b = 8, c;\nc = a - b;`,
    concept: 'Mesmo padrão da soma, trocando o opcode. A ordem dos operandos importa: c = a - b, não b - a.',
    guidingQuestion: 'Se a ordem dos operandos fosse trocada, o resultado mudaria? Teste mentalmente.',
    ia32: {
      asm: `.text\nmain:\n    mov eax, 20  ; a\n    mov ebx, 8   ; b\n    sub eax, ebx ; c = a - b`,
      variableMap: { a: 'EAX', b: 'EBX', c: 'EAX (sobrescrito)' },
    },
    mips: {
      asm: `.text\nmain:\n    li $s0, 20\n    li $s1, 8\n    sub $t0, $s0, $s1  # c = a - b`,
      variableMap: { a: '$s0', b: '$s1', c: '$t0' },
    },
  },
  {
    id: 'comparacao',
    order: 5,
    title: '5. Comparação',
    cCode: `int a = 7, b = 3, r;\nr = (a > b);`,
    concept:
      'MIPS tem uma instrução dedicada (slt) que produz 0/1 diretamente. IA-32 não tem: precisa comparar (CMP) e desviar condicionalmente para materializar o booleano — mais instruções para a mesma ideia.',
    guidingQuestion: 'Qual ISA precisou de desvio condicional só para calcular um valor booleano?',
    ia32: {
      asm: `.text\nmain:\n    mov eax, 7    ; a\n    mov ebx, 3    ; b\n    cmp eax, ebx\n    jg maior\n    mov ecx, 0    ; r = 0\n    jmp fim\nmaior:\n    mov ecx, 1    ; r = 1\nfim:`,
      variableMap: { a: 'EAX', b: 'EBX', r: 'ECX' },
    },
    mips: {
      asm: `.text\nmain:\n    li $s0, 7          # a\n    li $s1, 3          # b\n    slt $t0, $s1, $s0  # r = (b < a) = (a > b)`,
      variableMap: { a: '$s0', b: '$s1', r: '$t0' },
    },
  },
  {
    id: 'if',
    order: 6,
    title: '6. if',
    cCode: `int a = 5, b = 5, c = 0;\nif (a == b) {\n    c = 100;\n}`,
    concept:
      'O "if" em C não existe no hardware: o compilador o transforma em comparação + desvio condicional que PULA o bloco quando a condição é falsa (lógica invertida).',
    guidingQuestion: 'O desvio testa a==b ou o contrário? Por que o compilador inverte a condição?',
    ia32: {
      asm: `.text\nmain:\n    mov eax, 5   ; a\n    mov ebx, 5   ; b\n    mov ecx, 0   ; c\n    cmp eax, ebx\n    jne fim_if\n    mov ecx, 100 ; c = 100\nfim_if:`,
      variableMap: { a: 'EAX', b: 'EBX', c: 'ECX' },
    },
    mips: {
      asm: `.text\nmain:\n    li $s0, 5        # a\n    li $s1, 5        # b\n    li $t0, 0        # c\n    bne $s0, $s1, fim_if\n    li $t0, 100      # c = 100\nfim_if:`,
      variableMap: { a: '$s0', b: '$s1', c: '$t0' },
    },
  },
  {
    id: 'while',
    order: 7,
    title: '7. while',
    cCode: `int i = 0, n = 5;\nwhile (i < n) {\n    i = i + 1;\n}`,
    concept:
      'Um laço é comparação + desvio condicional para SAIR + desvio incondicional para VOLTAR ao topo. É a mesma "receita" do if, só que com um salto de volta.',
    guidingQuestion: 'Quantas vezes o desvio condicional de saída é testado? E o corpo do laço, quantas vezes roda?',
    ia32: {
      asm: `.text\nmain:\n    mov eax, 0   ; i\n    mov ebx, 5   ; n\nloop:\n    cmp eax, ebx\n    jge fim_loop\n    inc eax      ; i = i + 1\n    jmp loop\nfim_loop:`,
      variableMap: { i: 'EAX', n: 'EBX' },
    },
    mips: {
      asm: `.text\nmain:\n    li $s0, 0          # i\n    li $s1, 5          # n\nloop:\n    bge $s0, $s1, fim_loop\n    addi $s0, $s0, 1   # i = i + 1\n    j loop\nfim_loop:`,
      variableMap: { i: '$s0', n: '$s1' },
    },
  },
  {
    id: 'vetor',
    order: 8,
    title: '8. Acesso a vetor',
    cCode: `int v[5] = {1, 2, 3, 4, 5};\nint i = 2;\nv[i] = 10;`,
    concept:
      'Aqui os dados finalmente vão para a RAM. O IA-32 tem um modo de endereçamento pronto para índice×escala ([base + índice*4]); o MIPS não tem — o compilador precisa gerar um sll explícito para multiplicar o índice por 4 antes de somar ao endereço base.',
    guidingQuestion: 'Qual ISA calculou o deslocamento (índice × 4) com uma instrução própria, e qual precisou de um sll manual?',
    ia32: {
      asm: `.data\nv: dd 1, 2, 3, 4, 5\n.text\nmain:\n    mov ecx, 2          ; i (índice)\n    mov eax, 10\n    mov [v+ecx*4], eax  ; v[i] = 10`,
      variableMap: { v: 'rótulo v (RAM)', i: 'ECX', 'valor a gravar': 'EAX' },
    },
    mips: {
      asm: `.data\nv: .word 1, 2, 3, 4, 5\n.text\nmain:\n    li $t1, 2          # i (índice)\n    sll $t1, $t1, 2    # i * 4 (tamanho da word)\n    la $t0, v          # endereço base de v\n    add $t0, $t0, $t1  # endereço = base + i*4\n    li $t2, 10\n    sw $t2, 0($t0)     # v[i] = 10`,
      variableMap: { v: 'rótulo v (RAM)', i: '$t1', 'endereço calculado': '$t0', 'valor a gravar': '$t2' },
    },
  },
  {
    id: 'ponteiro',
    order: 9,
    title: '9. Ponteiro',
    cCode: `int y = 42;\nint *p = &y;\nint x = *p;`,
    concept:
      'Um ponteiro é só um endereço guardado num registrador. "&y" carrega o endereço (sem tocar a RAM); "*p" usa esse endereço para efetivamente ler a RAM — dois passos bem distintos.',
    guidingQuestion: 'Qual instrução calculou um endereço, e qual foi a única que de fato acessou a memória RAM?',
    ia32: {
      asm: `.data\ny: dd 42\n.text\nmain:\n    mov eax, y     ; p = &y (endereço, NÃO acessa a RAM)\n    mov ebx, [eax] ; x = *p  (agora sim, lê a RAM)`,
      variableMap: { y: 'rótulo y (RAM)', 'p (ponteiro)': 'EAX', x: 'EBX' },
    },
    mips: {
      asm: `.data\ny: .word 42\n.text\nmain:\n    la $t0, y      # p = &y (endereço, NÃO acessa a RAM)\n    lw $t1, 0($t0) # x = *p  (agora sim, lê a RAM)`,
      variableMap: { y: 'rótulo y (RAM)', 'p (ponteiro)': '$t0', x: '$t1' },
    },
  },
  {
    id: 'funcao',
    order: 10,
    title: '10. Chamada de função',
    cCode: `int soma(int a, int b) {\n    return a + b;\n}\nint main() {\n    int c = soma(4, 7);\n}`,
    concept:
      'Chamar uma função exige uma convenção combinada entre chamador e chamado: onde vão os argumentos, onde volta o resultado, quem salva o endereço de retorno e como a pilha é usada. IA-32 usa PUSH/CALL/RET e uma pilha explícita em RAM; MIPS usa registradores $a0-$a3 para argumentos e $ra para o retorno, evitando a RAM quando possível.',
    guidingQuestion: 'Em qual ISA os argumentos passaram pela memória RAM (pilha), e em qual ficaram só em registradores?',
    ia32: {
      asm: `.text\nmain:\n    mov eax, 7    ; segundo argumento (b)\n    push eax\n    mov eax, 4    ; primeiro argumento (a)\n    push eax\n    call soma\n    add esp, 8    ; limpa os argumentos empilhados\n    mov ebx, eax  ; c = valor de retorno\n    jmp fim       ; não deixar o fluxo "cair" dentro de soma\nsoma:\n    push ebp\n    mov ebp, esp\n    mov eax, [ebp+8]   ; a\n    add eax, [ebp+12]  ; a + b (resultado em EAX)\n    pop ebp\n    ret\nfim:`,
      variableMap: { 'argumentos (a, b)': 'pilha (RAM), via ESP/EBP', 'retorno': 'EAX', c: 'EBX' },
    },
    mips: {
      asm: `.text\nmain:\n    li $a0, 4     # primeiro argumento (a)\n    li $a1, 7     # segundo argumento (b)\n    jal soma\n    move $t0, $v0 # c = valor de retorno\n    j fim         # não deixar o fluxo "cair" dentro de soma\nsoma:\n    add $v0, $a0, $a1  # retorno = a + b\n    jr $ra\nfim:`,
      variableMap: { 'argumentos (a, b)': '$a0, $a1 (registradores, sem RAM)', retorno: '$v0', c: '$t0' },
    },
  },
]

export function getExampleById(id: string): MicroExample | undefined {
  return MICRO_EXAMPLES.find((e) => e.id === id)
}
