export interface ComparisonField {
  label: string
  a: string
  b: string
}

export interface BoardComparison {
  id: string
  title: string
  boardAId: string
  boardBId: string
  fields: ComparisonField[]
  archNote: string
  orgNote: string
}

export const comparisons: BoardComparison[] = [
  {
    id: "babyat-vs-atx",
    title: "Mesmo Socket 7, organizações diferentes",
    boardAId: "p5sb",
    boardBId: "sp97xv",
    fields: [
      { label: "Chipset", a: "SiS 530 + SiS5595", b: "SiS5582 ou SiS5598" },
      { label: "Form factor", a: "Baby AT", b: "ATX" },
      { label: "Alimentação", a: "AT + ATX simultâneos", b: "ATX 20 pinos" },
      { label: "Memória", a: "3× DIMM SDRAM PC100", b: "2× DIMM ou 4× SIMM" },
    ],
    archNote:
      "Ambas executam o mesmo conjunto de instruções x86/Socket 7 — mesma arquitetura de CPU suportada.",
    orgNote:
      "Forma física, alimentação e chipset de suporte são diferentes — pura organização/implementação.",
  },
  {
    id: "p4-vs-amd64",
    title: "Mesma época, arquiteturas diferentes",
    boardAId: "p4v800x",
    boardBId: "k8vmx",
    fields: [
      { label: "CPU", a: "Intel Pentium 4, Socket 478", b: "AMD Athlon 64, Socket 754" },
      { label: "ISA", a: "x86 32-bit", b: "AMD64 (32 e 64-bit)" },
      { label: "Bus CPU", a: "FSB 800/533/400 MHz", b: "HyperTransport, 800 MHz" },
      { label: "Chipset", a: "VIA PT800 + VT8237", b: "VIA K8M800 (IGP) + VT8237R" },
    ],
    archNote:
      "A extensão AMD64 muda o conjunto de instruções visível ao software (registradores/modo de 64 bits) — isso é arquitetura.",
    orgNote:
      "FSB compartilhado vs. HyperTransport ponto-a-ponto é uma escolha de como a CPU se conecta ao restante do sistema.",
  },
  {
    id: "discrete-vs-soc",
    title: "Chipset discreto vs. tudo em um só chip",
    boardAId: "k8vmx",
    boardBId: "ipx1800g1",
    fields: [
      { label: "Chipset", a: "North+South bridge (2 chips)", b: "Integrado à CPU (SoC)" },
      { label: "Memória", a: "DDR, 2× DIMM 184 vias", b: "DDR3, 2× SO-DIMM" },
      { label: "Expansão", a: "AGP 8X + 3× PCI", b: "1× PCIe x1" },
      { label: "Vídeo", a: "IGP no northbridge ou AGP discreta", b: "Integrado ao SoC" },
    ],
    archNote:
      "Ambas oferecem a capacidade de exibir vídeo e expandir periféricos — essas capacidades continuam existindo.",
    orgNote:
      "Onde e como essas capacidades são fisicamente implementadas mudou radicalmente: de múltiplos chips para um único SoC.",
  },
]
