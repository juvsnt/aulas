import type { ConceptQuote } from "./types"

/**
 * Citacoes levantadas em md/ (livros de referencia do projeto). Mantidas o
 * mais proximas possivel do texto original, com fonte precisa.
 */
export const conceptQuotes: ConceptQuote[] = [
  {
    id: "stallings-def",
    quote:
      "Arquitetura de computador refere-se aos atributos de um sistema visíveis a um programador... Organização de computador refere-se às unidades operacionais e suas interconexões que realizam as especificações de arquitetura.",
    source: "Stallings, Arquitetura e Organização de Computadores, 10ª ed., Cap. 1, Seção 1.1",
  },
  {
    id: "stallings-example",
    quote:
      "É uma questão de projeto de arquitetura se um computador terá uma instrução de multiplicação. É uma questão de organização se essa instrução será implementada por uma unidade de multiplicação especial ou por um mecanismo que faça uso repetido da unidade de adição do sistema.",
    source: "Stallings, Arquitetura e Organização de Computadores, 10ª ed., Cap. 1, Seção 1.1",
    note: "O exemplo clássico do próprio livro — usado nesta aplicação como primeiro contato com a distinção.",
  },
  {
    id: "stallings-family",
    quote:
      "Muitos fabricantes de computador oferecem uma família de modelos de computador, todos com a mesma arquitetura, mas com diferenças na organização... um exemplo proeminente é a arquitetura IBM System/370.",
    source: "Stallings, Arquitetura e Organização de Computadores, 10ª ed., Cap. 1, Seção 1.1",
  },
  {
    id: "etec-simple",
    quote:
      "A arquitetura de computadores se refere ao comportamento de um sistema computacional visível para o programador... A organização de computadores se refere às unidades estruturais e seus relacionamentos lógicos e eletrônicos.",
    source: "Livro básico de Arquitetura de Computadores (e-Tec Brasil), Aula 1 — citando Stallings (2010)",
  },
  {
    id: "hwang-unicamp",
    quote:
      "O estudo de arquiteturas de conjuntos de instruções (requisitos de programação/software) e organizações de implementação de máquinas (hardware).",
    source: "Hwang, citado em Ricarte, Organização de Computadores (UNICAMP, EA960), Prefácio",
  },
  {
    id: "ph-isa",
    quote:
      "A arquitetura do conjunto de instruções inclui tudo o que os programadores precisam saber para fazer um programa em linguagem de máquina binária funcionar corretamente, incluindo instruções, dispositivos de E/S etc.",
    source: "Patterson & Hennessy, Organização e Projeto de Computadores, 5ª ed., Cap. 1",
  },
  {
    id: "ph-clock",
    quote:
      "Podemos falar sobre as funções de um relógio digital (marcar as horas, exibir as horas, definir o alarme) sem falar sobre o hardware do relógio (o cristal de quartzo, os visores de LEDs, os botões plásticos).",
    source: "Patterson & Hennessy, Organização e Projeto de Computadores, 5ª ed., Cap. 1",
    note: "Analogia usada para mostrar que a arquitetura descreve função, independente da implementação.",
  },
  {
    id: "tanenbaum-nuance",
    quote:
      "A arquitetura nesse contexto representa a organização interna da CPU, que costuma receber um codinome.",
    source: "Tanenbaum, Organização Estruturada de Computadores, Cap. 3",
    note: "Mostra que, no uso coloquial da indústria, \"arquitetura\" às vezes se refere ao que a definição formal chamaria de organização.",
  },
]
