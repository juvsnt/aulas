import type { PairedStatement, ChallengeCase, MentimeterQuestion } from "./types"

export const pairedStatements: PairedStatement[] = [
  {
    id: "pair-pci",
    boardId: "sp97xv",
    specific: "Esta placa possui quatro slots PCI e quatro slots ISA.",
    specificCategory: "organization",
    specificReason: "Descreve uma implementação física específica e contável.",
    general: "O sistema oferece suporte ao barramento PCI.",
    generalCategory: "depends",
    generalReason:
      "Fala de uma interface/capacidade padronizada — não apenas da contagem de slots. Exige análise mais cuidadosa.",
    source: "p. 8, p. 10",
  },
  {
    id: "pair-socket754",
    boardId: "k8vmx",
    specific: "O processador desta placa é encaixado em um Socket 754.",
    specificCategory: "organization",
    specificReason: "Descreve a forma física de conexão do processador à placa.",
    general: "O processador suporta a arquitetura AMD64 de 64 bits.",
    generalCategory: "architecture",
    generalReason:
      "Descreve um conjunto de instruções que o software precisa conhecer para usar o modo de 64 bits.",
    source: "p. 9, p. 12",
  },
  {
    id: "pair-ddr",
    boardId: "p4v800x",
    specific: "A placa tem três soquetes DIMM para memória DDR.",
    specificCategory: "organization",
    specificReason: "Contagem física de soquetes de memória disponíveis na placa.",
    general: "A placa suporta memória DDR400.",
    generalCategory: "depends",
    generalReason:
      "O padrão e a velocidade de memória aceitos afetam como o BIOS/SO configuram o acesso — mistura capacidade declarada com limite de implementação.",
    source: "p. ix",
  },
]

export const challengeCases: ChallengeCase[] = [
  // Nivel 1 - evidente
  {
    id: "l1-gateway-socket",
    level: 1,
    boardId: "gateway",
    evidence: "O soquete do processador é do tipo Socket 5.",
    category: "organization",
    reason: "É a forma física de conexão da CPU à placa — puramente implementação.",
    source: "ficha do produto",
  },
  {
    id: "l1-k8vmx-form",
    level: 1,
    boardId: "k8vmx",
    evidence: "A placa é microATX, com 24,5 × 24,5 cm.",
    category: "organization",
    reason: "Forma física e dimensões são características de implementação/organização.",
    source: "p. 10",
  },
  {
    id: "l1-p4v800x-pci",
    level: 1,
    boardId: "p4v800x",
    evidence: "A placa possui cinco slots PCI.",
    category: "organization",
    reason: "Contagem física de slots — decisão concreta de organização do fabricante.",
    source: "p. ix",
  },
  {
    id: "l1-ipx-dimm",
    level: 1,
    boardId: "ipx1800g1",
    evidence: "A placa tem dois soquetes de memória SO-DIMM.",
    category: "organization",
    reason: "Quantidade de bancos de memória é uma característica física, contável.",
    source: "ficha do produto",
  },

  // Nivel 2 - exige raciocinio
  {
    id: "l2-sp97xv-cache",
    level: 2,
    boardId: "sp97xv",
    evidence: "A placa tem 512KB de cache L2 pipelined-burst.",
    category: "organization",
    reason:
      "Cache acelera o acesso à memória sem mudar o que o programador pode fazer — é o exemplo clássico de Stallings de atributo transparente ao programador.",
    source: "p. 8",
  },
  {
    id: "l2-k8vmx-igp",
    level: 2,
    boardId: "k8vmx",
    evidence: "O chipset inclui um controlador de vídeo integrado (IGP) no northbridge.",
    category: "organization",
    reason:
      "Colocar o processamento de vídeo dentro do northbridge, em vez de usar uma placa separada, é uma escolha de como implementar a saída de vídeo.",
    source: "p. 9, p. 13",
  },
  {
    id: "l2-p4v800x-bios",
    level: 2,
    boardId: "p4v800x",
    evidence: "O BIOS é armazenado em uma Flash ROM de 4 Mbit.",
    category: "organization",
    reason:
      "O tamanho do chip de memória flash é um detalhe de implementação; o que importa para o software é a interface que o BIOS expõe.",
    source: "p. x",
  },
  {
    id: "l2-k8vmx-raid",
    level: 2,
    boardId: "k8vmx",
    evidence: "O southbridge integra um controlador RAID 0/1/JBOD.",
    category: "organization",
    reason:
      "RAID por hardware é uma funcionalidade adicional implementada dentro do chip — exige entender o que o componente faz para perceber que é organização.",
    source: "p. 9",
  },

  // Nivel 3 - zona cinzenta
  {
    id: "l3-sp97xv-pci",
    level: 3,
    boardId: "sp97xv",
    evidence: "O sistema oferece suporte ao barramento PCI.",
    category: "depends",
    reason: "A formulação geral mistura interface padronizada e implementação física.",
    archNote:
      "PCI define um padrão de configuração e enumeração de dispositivos que o BIOS e o sistema operacional precisam conhecer.",
    orgNote:
      "Quantos slots existem, como estão roteados eletricamente e qual chip implementa o controlador PCI são decisões de organização.",
    source: "p. 8, p. 10",
  },
  {
    id: "l3-gateway-cpu-range",
    level: 3,
    boardId: "gateway",
    evidence: "A placa é compatível com processadores Intel Pentium de 60 a 90MHz.",
    category: "depends",
    reason: "Mistura a família de processadores suportada com um limite concreto de operação.",
    archNote:
      "Ser compatível com a família Pentium (o conjunto de instruções x86 daquela geração) é uma capacidade visível ao software.",
    orgNote:
      "A faixa específica de clock (60–90MHz) é um limite elétrico/organizacional — depende do regulador de tensão e da qualidade das trilhas da placa.",
    source: "ficha do produto",
  },
  {
    id: "l3-k8vmx-memlimit",
    level: 3,
    boardId: "k8vmx",
    evidence: "A placa suporta até 2GB de memória DDR.",
    category: "depends",
    reason: "Combina o espaço de endereçamento suportado com um limite físico de implementação.",
    archNote:
      "O tipo de memória e o espaço de endereçamento que o controlador aceita é uma capacidade que o SO precisa conhecer.",
    orgNote:
      "O limite de 2GB vem de ter apenas 2 soquetes físicos — com mais soquetes, o limite poderia ser maior mesmo mantendo a mesma arquitetura.",
    source: "p. 9, p. 13",
  },
  {
    id: "l3-p4v800x-sata",
    level: 3,
    boardId: "p4v800x",
    evidence: "A placa oferece suporte a Serial ATA (SATA), além dos conectores IDE tradicionais.",
    category: "depends",
    reason: "Um novo protocolo de armazenamento convivendo com o antigo.",
    archNote:
      "SATA é um novo protocolo de comunicação com o dispositivo — o sistema operacional precisa de um modelo de driver diferente para reconhecê-lo.",
    orgNote:
      "O conector físico, a cablagem e o chip controlador SATA específico (parte do southbridge VIA VT8237) são decisões de organização.",
    source: "p. ix, p. 1-5",
  },
  {
    id: "l3-ipx-pcie",
    level: 3,
    boardId: "ipx1800g1",
    evidence: "A placa possui um slot PCI Express x1.",
    category: "depends",
    reason: "PCI Express é ao mesmo tempo um novo protocolo e uma implementação física específica.",
    archNote:
      "PCI Express é um protocolo serial ponto-a-ponto que substituiu o barramento paralelo do PCI — o modelo de driver do SO muda.",
    orgNote:
      "Ter apenas 1 slot, com 1 linha (x1), é uma escolha de organização ligada ao tamanho reduzido da placa Mini-ITX.",
    source: "ficha do produto",
  },
]

export const mentimeterQuestions: MentimeterQuestion[] = [
  { id: "m1", prompt: "512 KB de cache L2 na placa.", controversial: false },
  { id: "m2", prompt: "Suporte ao barramento PCI.", controversial: true },
  {
    id: "m3",
    prompt: "O processador realiza multiplicação diretamente em hardware.",
    controversial: true,
  },
  {
    id: "m4",
    prompt: "A placa aceita módulos SIMM e DIMM, mas nunca ao mesmo tempo.",
    controversial: false,
  },
  { id: "m5", prompt: "O chipset está integrado ao processador (SoC).", controversial: true },
  { id: "m6", prompt: "A placa suporta RAID por hardware.", controversial: true },
]

export function casesForLevel(level: 1 | 2 | 3): ChallengeCase[] {
  return challengeCases.filter((c) => c.level === level)
}
