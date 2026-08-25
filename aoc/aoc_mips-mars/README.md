# Do código C ao hardware

Aula interativa em formato web sobre **Assembly e ISA com IA-32/x86 e
MIPS**, respondendo progressivamente: como um trecho pequeno escrito em C se
transforma em instruções que um processador executa fisicamente?

Não é uma conversão de slides: dez microprogramas progressivos (de
`return 10;` até chamada de função) são executados de verdade por dois
interpretadores próprios — um para IA-32/x86 de 32 bits, outro para MIPS32 —
com visualização sincronizada de código, registradores, memória RAM e o
caminho de dados RAM ↔ CPU ↔ Registradores ↔ ALU a cada instrução. Inclui um
comparador lado a lado IA-32 × MIPS com quiz interativo, um módulo dedicado à
codificação de instruções (Assembly → bits) e uma prática de laboratório
conectando a aplicação ao simulador MARS.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção em dist/
npm run preview  # servir o build localmente
npx tsx scripts/smoke.ts   # testa os 20 programas (10 exemplos x 2 ISAs) de ponta a ponta
```

## Stack

Vite · React 19 · TypeScript · React Router (HashRouter) · Tailwind CSS v4.

## Estrutura

- `src/engine/` — os dois interpretadores reais (`mips.ts`, `ia32.ts`) e o
  adaptador comum (`runner.ts`) que permite reusar a mesma UI de
  step-by-step para as duas ISAs.
- `src/data/examples.ts` — os 10 microprogramas (C, IA-32 e MIPS) usados em
  toda a aula.
- `src/components/` — visualizações reutilizáveis: código com highlight de
  linha, grade de registradores, painel de memória, diagrama animado do
  data-path, quiz.
- `src/routes/` — os 8 módulos da aula (introdução, IA-32, exemplos IA-32,
  codificação, MIPS, exemplos MIPS, comparador, laboratório).

Nenhuma instrução ou comportamento de ISA foi inventado: os interpretadores
seguem a especificação real do MIPS32 e do subconjunto usado de IA-32/x86.
