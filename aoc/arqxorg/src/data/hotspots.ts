import type { Hotspot } from "./types"

/**
 * Coordenadas x/y sao percentuais (0-100) relativos a imagem de exploracao
 * de cada placa (ver motherboards.ts -> images.explorer), posicionadas por
 * inspecao visual das fotos/diagramas reais extraidos dos manuais. Cada
 * hotspot cita a fonte da especificacao correspondente.
 */
export const hotspots: Hotspot[] = [
  // ---------------- Gateway MBDPCI016AAWW ----------------
  {
    id: "gateway-socket",
    boardId: "gateway",
    label: "Socket 5",
    x: 48,
    y: 66,
    category: "organization",
    question: "O encaixe físico do processador nesta placa representa...",
    explanation:
      "O Socket 5 é a forma física concreta usada para conectar a CPU à placa — quantos pinos, qual formato, qual pressão de encaixe. É uma decisão de implementação do fabricante.",
    source: "ficha do produto",
  },
  {
    id: "gateway-isa",
    boardId: "gateway",
    label: "Slots ISA",
    x: 20,
    y: 26,
    category: "organization",
    question: "Ter exatamente 4 slots ISA nesta placa é...",
    explanation:
      "A quantidade de slots ISA implementados fisicamente na placa é uma escolha concreta de organização — o fabricante decidiu reservar espaço e trilhas para 4 conectores.",
    source: "ficha do produto",
  },
  {
    id: "gateway-pci",
    boardId: "gateway",
    label: "Slots PCI",
    x: 40,
    y: 29,
    category: "depends",
    question: "\"Esta placa possui 3 slots PCI\" vs. \"o sistema suporta PCI\" — qual classificação?",
    explanation:
      "Depende exatamente do que está sendo afirmado. A contagem de 3 slots é organização; já o padrão PCI em si — como o barramento se comporta, como dispositivos são endereçados — é uma interface que o software também precisa conhecer.",
    archNote: "PCI define um protocolo de configuração e enumeração que o BIOS e o sistema operacional precisam suportar.",
    orgNote: "Quantos slots existem e como estão roteados eletricamente na placa é decisão de organização do fabricante.",
    source: "ficha do produto",
  },
  {
    id: "gateway-chipset",
    boardId: "gateway",
    label: "Chipset Intel 430FX",
    x: 37,
    y: 46,
    category: "organization",
    question: "O chip 430FX ao lado do processador representa...",
    explanation:
      "O chipset é o conjunto de circuitos que efetivamente implementa a comunicação entre CPU, memória e periféricos — a escolha de qual chipset usar é uma decisão de organização.",
    source: "ficha do produto",
  },
  {
    id: "gateway-simm",
    boardId: "gateway",
    label: "Memória SIMM",
    x: 79,
    y: 44,
    category: "organization",
    question: "Usar módulos SIMM de 72 vias em vez de outro formato é...",
    explanation:
      "O formato físico do módulo de memória (SIMM 72 vias, neste caso) é uma escolha de organização de como a memória é fisicamente conectada à placa.",
    source: "ficha do produto",
  },

  // ---------------- ASUS SP97-XV ----------------
  {
    id: "sp97xv-socket",
    boardId: "sp97xv",
    label: "CPU ZIF Socket 7",
    x: 64,
    y: 29,
    category: "depends",
    question: "\"Esta placa tem Socket 7\" vs. \"o processador suporta o conjunto de instruções x86 com MMX\" — qual classificação?",
    explanation:
      "O tipo de soquete (Socket 7) é organização — descreve a forma física de conexão. Já o conjunto de instruções que os processadores compatíveis executam (x86 com extensão MMX) é arquitetura, pois é isso que o software precisa conhecer para rodar.",
    archNote: "O conjunto de instruções x86/MMX suportado é visível e relevante ao software.",
    orgNote: "O formato físico do soquete (ZIF, 321 pinos) é puramente uma decisão de implementação.",
    source: "p. 8",
  },
  {
    id: "sp97xv-memory",
    boardId: "sp97xv",
    label: "Slots SIMM e DIMM",
    x: 33,
    y: 32,
    category: "organization",
    question: "A placa aceita SIMM OU DIMM, nunca os dois ao mesmo tempo. Isso é...",
    explanation:
      "Essa é uma limitação elétrica/física de implementação — os dois tipos de módulo compartilham parte do circuito de endereçamento, então o fabricante organizou a placa para aceitar só um por vez.",
    source: "p. 8, p. 10",
  },
  {
    id: "sp97xv-chipset",
    boardId: "sp97xv",
    label: "Chipset SiS5582/5598",
    x: 61,
    y: 46,
    category: "organization",
    question: "A escolha entre o chipset SiS5582 e o SiS5598 (com vídeo integrado) é...",
    explanation:
      "É uma decisão de organização: o SiS5598 implementa uma função adicional (vídeo 2D/3D) fisicamente dentro do chipset, mas isso não é uma capacidade obrigatória da arquitetura do sistema.",
    source: "p. 8, p. 10",
  },
  {
    id: "sp97xv-cache",
    boardId: "sp97xv",
    label: "Cache L2 512KB",
    x: 78,
    y: 39,
    category: "organization",
    question: "Ter 512KB de cache L2 pipelined-burst nesta placa é...",
    explanation:
      "Cache é o exemplo clássico de atributo organizacional: acelera o acesso à memória sem mudar o que o programador pode fazer — é transparente ao software, só afeta desempenho.",
    source: "p. 8",
  },
  {
    id: "sp97xv-pci-isa",
    boardId: "sp97xv",
    label: "Slots ISA e PCI",
    x: 44,
    y: 69,
    category: "organization",
    question: "4 slots ISA + 4 slots PCI nesta placa (um deles com extensão MediaBus) é...",
    explanation:
      "A contagem e a disposição física dos slots de expansão — incluindo a extensão proprietária MediaBus — é uma decisão concreta de organização do fabricante.",
    source: "p. 8, p. 10, p. 22",
  },

  // ---------------- ASUS P4V800-X ----------------
  {
    id: "p4v800x-socket",
    boardId: "p4v800x",
    label: "Socket 478",
    x: 46,
    y: 34,
    category: "organization",
    question: "O Socket 478 para Pentium 4/Celeron representa...",
    explanation:
      "Assim como o Socket 5 e o Socket 7, é a forma física de conexão do processador — organização, não arquitetura.",
    source: "p. ix, p. 1-5",
  },
  {
    id: "p4v800x-northbridge",
    boardId: "p4v800x",
    label: "Northbridge VIA PT800",
    x: 46,
    y: 57,
    category: "organization",
    question: "O chip VIA PT800, que conecta processador, memória e AGP, representa...",
    explanation:
      "O northbridge é a implementação concreta que realiza a comunicação de alta velocidade entre CPU, memória e vídeo — uma peça de organização do sistema.",
    source: "p. ix, p. 1-5",
  },
  {
    id: "p4v800x-southbridge",
    boardId: "p4v800x",
    label: "Southbridge VIA VT8237",
    x: 63,
    y: 78,
    category: "organization",
    question: "O chip VIA VT8237, responsável por IDE, SATA, USB e PCI, representa...",
    explanation:
      "O southbridge concentra os controladores de periféricos mais lentos — outra peça concreta de organização, separada do northbridge por uma decisão de projeto.",
    source: "p. ix, p. 1-5",
  },
  {
    id: "p4v800x-memory",
    boardId: "p4v800x",
    label: "3× DDR DIMM",
    x: 67,
    y: 37,
    category: "depends",
    question: "\"A placa suporta DDR400/333/266\" — Arquitetura, Organização ou Depende?",
    explanation:
      "O tipo e a velocidade de memória que o controlador aceita é uma capacidade que afeta como o BIOS/SO configuram o acesso à memória (arquitetural); já o número de soquetes físicos e o chip controlador usado são organização.",
    archNote: "O padrão de memória suportado (DDR400/333/266) é uma capacidade que o BIOS e o SO precisam reconhecer.",
    orgNote: "Ter exatamente 3 soquetes DIMM, e não 2 ou 4, é uma escolha física do fabricante.",
    source: "p. ix",
  },
  {
    id: "p4v800x-storage",
    boardId: "p4v800x",
    label: "IDE e SATA",
    x: 78,
    y: 49,
    category: "depends",
    question: "\"A placa oferece suporte a Serial ATA, além do IDE tradicional\" — qual classificação?",
    explanation:
      "SATA é um novo protocolo de comunicação com o armazenamento — o sistema operacional precisa de um modelo de driver diferente para reconhecê-lo (arquitetural). O conector físico e o chip controlador específico são organização.",
    archNote: "SATA exige um novo modelo de driver no sistema operacional — visível ao software.",
    orgNote: "O conector físico, a cablagem e o controlador SATA implementado no southbridge são organização.",
    source: "p. ix, p. 1-5",
  },
  {
    id: "p4v800x-agp",
    boardId: "p4v800x",
    label: "Slot AGP",
    x: 44,
    y: 68,
    category: "organization",
    question: "Ter um único slot AGP 8X (e não PCI Express) para vídeo é...",
    explanation:
      "Nesta geração, o vídeo dedicado ainda usa o barramento AGP — uma interface física específica que seria substituída pelo PCI Express nas gerações seguintes. A presença física do slot é organização.",
    source: "p. ix",
  },

  // ---------------- ASUS K8V-MX ----------------
  {
    id: "k8vmx-socket",
    boardId: "k8vmx",
    label: "Socket 754",
    x: 47,
    y: 28,
    category: "depends",
    question: "\"O processador suporta arquitetura AMD64 de 64 bits\" — Arquitetura, Organização ou Depende?",
    explanation:
      "O Socket 754 em si (organização) é diferente da extensão AMD64 que os processadores compatíveis executam (arquitetura). São dois aspectos do mesmo componente físico.",
    archNote: "AMD64 estende o conjunto de instruções x86 para 64 bits — visível e essencial para o software.",
    orgNote: "O formato do soquete (754 pinos) é puramente uma escolha de conexão física.",
    source: "p. 9, p. 12",
  },
  {
    id: "k8vmx-northbridge",
    boardId: "k8vmx",
    label: "Northbridge VIA K8M800 (com vídeo integrado)",
    x: 40,
    y: 48,
    category: "depends",
    question: "\"Esta placa tem vídeo integrado além de um slot AGP\" — qual classificação?",
    explanation:
      "Oferecer saída de vídeo é uma capacidade que o sistema declara ter (arquitetural). Já produzir esse vídeo dentro do northbridge, em vez de usar uma placa AGP separada, é uma escolha de organização — a mesma capacidade pode ser implementada de duas formas.",
    archNote: "Ter saída de vídeo disponível é uma capacidade visível ao usuário e ao BIOS de configuração.",
    orgNote: "Se o vídeo é produzido pelo northbridge ou por uma placa AGP é uma escolha de implementação.",
    source: "p. 9, p. 13",
  },
  {
    id: "k8vmx-hypertransport",
    boardId: "k8vmx",
    label: "Barramento HyperTransport",
    x: 47,
    y: 22,
    category: "organization",
    question: "A comunicação CPU-chipset via HyperTransport (em vez de um FSB compartilhado) é...",
    explanation:
      "HyperTransport é uma tecnologia de interconexão ponto-a-ponto — uma forma diferente de organizar a comunicação entre CPU e chipset, mais rápida que o barramento compartilhado das placas Intel da mesma época.",
    source: "p. 9",
  },
  {
    id: "k8vmx-memory",
    boardId: "k8vmx",
    label: "2× DDR DIMM",
    x: 67,
    y: 35,
    category: "organization",
    question: "Ter exatamente 2 soquetes de memória DDR (e não 3, como a P4V800-X) é...",
    explanation:
      "O número de soquetes físicos de memória disponíveis na placa é uma decisão de organização do fabricante, mesmo que ambas as placas suportem o mesmo padrão DDR.",
    source: "p. 9, p. 13",
  },
  {
    id: "k8vmx-sata",
    boardId: "k8vmx",
    label: "2× SATA com RAID",
    x: 88,
    y: 56,
    category: "organization",
    question: "O controlador RAID 0/1/JBOD integrado no southbridge é...",
    explanation:
      "RAID por hardware, implementado dentro do southbridge VIA VT8237R, é uma funcionalidade adicional de organização — uma forma concreta de combinar discos que o fabricante escolheu oferecer.",
    source: "p. 9",
  },

  // ---------------- PCWare IPX1800G1 ----------------
  {
    id: "ipx1800g1-soc",
    boardId: "ipx1800g1",
    label: "CPU integrada (SoC)",
    x: 45,
    y: 35,
    category: "depends",
    question: "\"O chipset está integrado ao processador\" — Arquitetura, Organização ou Depende?",
    explanation:
      "A integração de CPU, GPU e chipset em um único circuito (SoC) é, sobretudo, organização — uma forma radicalmente diferente de implementar as mesmas capacidades que northbridge/southbridge ofereciam. Mas algumas dessas capacidades (como os modos de vídeo suportados) continuam sendo arquiteturais.",
    archNote: "As capacidades oferecidas (vídeo, portas, conjunto de instruções do Celeron) continuam existindo e são visíveis ao software.",
    orgNote: "Onde e como essas capacidades são implementadas mudou radicalmente: de múltiplos chips para um único SoC.",
    source: "ficha do produto",
  },
  {
    id: "ipx1800g1-memory",
    boardId: "ipx1800g1",
    label: "2× SO-DIMM DDR3",
    x: 45,
    y: 70,
    category: "organization",
    question: "Usar módulos SO-DIMM (formato compacto) em vez de DIMM padrão é...",
    explanation:
      "SO-DIMM é o formato físico compacto de módulo de memória, escolhido pelo fabricante para caber no formato Mini-ITX — uma decisão de organização ligada ao tamanho da placa.",
    source: "ficha do produto",
  },
  {
    id: "ipx1800g1-io",
    boardId: "ipx1800g1",
    label: "Painel traseiro (USB/HDMI/VGA)",
    x: 55,
    y: 10,
    category: "depends",
    question: "\"A placa tem 7 portas USB, incluindo USB 2.0 e 3.0\" — qual classificação?",
    explanation:
      "USB é um protocolo padronizado que o sistema operacional precisa suportar via driver — a versão (2.0 vs 3.0) afeta o que pode ser negociado (arquitetural). Quantas portas existem e quais são internas ou traseiras é organização.",
    archNote: "A versão do protocolo USB disponível afeta a velocidade que o software pode negociar com o dispositivo.",
    orgNote: "O número de portas físicas e sua distribuição no painel é uma escolha de organização.",
    source: "ficha do produto",
  },
  {
    id: "ipx1800g1-pcie",
    boardId: "ipx1800g1",
    label: "Slot PCI Express x1",
    x: 20,
    y: 60,
    category: "organization",
    question: "Ter um único slot PCIe x1 (em vez dos 7 slots ISA+PCI da geração 1) é...",
    explanation:
      "A quantidade e o tipo de slots de expansão físicos disponíveis é organização — reflete tanto a evolução tecnológica (PCIe substituiu PCI/AGP) quanto o tamanho reduzido da placa Mini-ITX.",
    source: "ficha do produto",
  },
]

export function hotspotsForBoard(boardId: string): Hotspot[] {
  return hotspots.filter((h) => h.boardId === boardId)
}
