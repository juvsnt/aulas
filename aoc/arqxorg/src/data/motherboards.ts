import type { Motherboard } from "./types"

import gatewayTopo from "@/assets/boards/gateway/topo.jpeg"
import sp97xvTopo from "@/assets/boards/sp97xv/topo.jpeg"
import sp97xvLayout from "@/assets/boards/sp97xv/layout.png"
import p4v800xTopo from "@/assets/boards/p4v800x/topo.jpeg"
import p4v800xLayout from "@/assets/boards/p4v800x/layout.png"
import k8vmxLayout from "@/assets/boards/k8vmx/layout.png"
import k8vmxSocket from "@/assets/boards/k8vmx/socket_cpu.jpeg"
import ipx1800g1Topo from "@/assets/boards/ipx1800g1/topo.jpeg"
import p5sbTopo from "@/assets/boards/p5sb/topo.jpeg"
import p5sbLayout from "@/assets/boards/p5sb/layout.png"

/**
 * Todas as especificacoes citam a pagina do manual ou a ficha de produto de
 * origem (ver slides/arqxorg/manuais_placamae/). Nenhum valor foi inventado.
 */
export const motherboards: Motherboard[] = [
  {
    id: "gateway",
    manufacturer: "Gateway",
    model: "MBDPCI016AAWW",
    generation: 1,
    year: "~1994",
    manual: "Ficha de produto Gateway MBDPCI016AAWW",
    cpuSupport: { value: "Intel Pentium 60–90 MHz", source: "ficha do produto" },
    socket: { value: "Socket 5", source: "ficha do produto" },
    chipset: { value: "Intel 430FX", source: "ficha do produto" },
    memory: { value: "4× SIMM 72 vias", source: "ficha do produto" },
    expansion: { value: "3× PCI + 4× ISA", source: "ficha do produto" },
    storage: { value: "2× IDE, 1× floppy", source: "ficha do produto" },
    io: { value: "2× PS/2, 1× paralela, 2× COM", source: "ficha do produto" },
    formFactor: { value: "Baby AT, 8,75\" × 10,25\"", source: "ficha do produto" },
    highlights: [
      "FSB de 50 MHz — o barramento do processador ainda corre bem abaixo do clock da CPU",
      "Convivência de slots ISA (herança do PC/AT) e PCI (novo padrão da época)",
      "Memória em módulos SIMM de 72 vias, instalados em pares",
    ],
    investigationPoints: [
      "Compare o número de slots ISA com o de slots PCI",
      "Observe o encaixe do processador: pinos inseridos diretamente no soquete",
      "Note a ausência de qualquer porta USB no painel traseiro",
    ],
    images: { gallery: gatewayTopo, explorer: gatewayTopo, explorerKind: "photo" },
  },
  {
    id: "sp97xv",
    manufacturer: "ASUS",
    model: "SP97-XV",
    generation: 2,
    year: "1997",
    manual: "Manual ASUS SP97-XV User's Manual",
    cpuSupport: {
      value: "Pentium 75–233MHz, AMD-K5/K6, Cyrix 6x86(MX)",
      source: "p. 8",
    },
    socket: { value: "Socket 7 (ZIF, 321 pinos)", source: "p. 8" },
    chipset: {
      value: "SiS5582 ou SiS5598 (SiS5598 com vídeo 2D/3D integrado)",
      source: "p. 8, p. 10",
    },
    memory: {
      value: "2× DIMM 168 vias OU 4× SIMM 72 vias — não simultâneos",
      source: "p. 8, p. 10",
    },
    expansion: {
      value: "4× ISA + 4× PCI (1 com extensão MediaBus)",
      source: "p. 8, p. 10, p. 22",
    },
    storage: {
      value: "2× IDE Bus Master UltraDMA/33, 2× floppy",
      source: "p. 8, p. 27",
    },
    io: { value: "2× USB, PS/2, paralela, 2× COM", source: "p. 9–10, p. 25" },
    formFactor: { value: "ATX (conector 20 pinos)", source: "p. 1, p. 10" },
    highlights: [
      "512KB de cache L2 pipelined-burst embarcado",
      "Aceita SIMM ou DIMM — mas nunca os dois ao mesmo tempo",
      "Já tem 2 portas USB, ainda uma novidade em 1997",
    ],
    investigationPoints: [
      "Localize os 4 slots ISA e os 4 slots PCI lado a lado",
      "Encontre os dois tipos de soquete de memória (SIMM e DIMM)",
      "Identifique o chip de cache L2 próximo ao soquete do processador",
    ],
    images: {
      gallery: sp97xvTopo,
      explorer: sp97xvLayout,
      explorerKind: "diagram",
    },
  },
  {
    id: "p4v800x",
    manufacturer: "ASUS",
    model: "P4V800-X",
    generation: 3,
    year: "2003",
    manual: "Manual ASUS P4V800-X User Guide",
    cpuSupport: {
      value: "Intel Pentium 4 / Celeron até 3.2GHz+, Hyper-Threading",
      source: "p. ix",
    },
    socket: { value: "Socket 478 (ZIF)", source: "p. ix, p. 1-5" },
    chipset: {
      value: "North bridge VIA PT800 + South bridge VIA VT8237",
      source: "p. ix, p. 1-5",
    },
    memory: {
      value: "3× DDR DIMM 184 vias, PC3200/2700/2100, até 3GB",
      source: "p. ix",
    },
    expansion: { value: "1× AGP 8X/4X + 5× PCI", source: "p. ix" },
    storage: {
      value: "2× UltraDMA133 (IDE) + 2× SATA com RAID 0/1",
      source: "p. ix, p. 1-5",
    },
    io: { value: "até 8 portas USB 2.0, LAN 10/100, áudio 6 canais", source: "p. ix" },
    formFactor: {
      value: "ATX, 12\" × 7.6\" (30.5 × 19.3 cm)",
      source: "p. x",
    },
    highlights: [
      "Chipset dividido em northbridge (VIA PT800) e southbridge (VIA VT8237) — cada um com uma função clara",
      "RAID 0/1 via Serial ATA já integrado ao southbridge",
      "AGP 8X para vídeo dedicado, ainda sem PCI Express",
    ],
    investigationPoints: [
      "Ache o northbridge (perto do processador e da memória) e o southbridge (perto dos slots PCI)",
      "Compare os 2 conectores SATA com os 2 conectores IDE tradicionais",
      "Localize o único slot AGP entre os 5 slots PCI",
    ],
    images: {
      gallery: p4v800xTopo,
      explorer: p4v800xLayout,
      explorerKind: "diagram",
    },
  },
  {
    id: "k8vmx",
    manufacturer: "ASUS",
    model: "K8V-MX",
    generation: 4,
    year: "2005",
    manual: "Manual ASUS K8V-MX User Guide",
    cpuSupport: {
      value: "AMD Athlon 64 / Sempron (arquitetura de 64 bits)",
      source: "p. 9, p. 12",
    },
    socket: { value: "Socket 754", source: "p. 9, p. 12" },
    chipset: {
      value: "North bridge VIA K8M800 (com vídeo integrado) + South bridge VIA VT8237R",
      source: "p. 9, p. 13",
    },
    memory: { value: "2× DDR DIMM 184 vias, até 2GB", source: "p. 9, p. 13" },
    expansion: { value: "1× AGP 8X + 3× PCI", source: "p. 9" },
    storage: {
      value: "2× SATA (RAID 0/1/JBOD) + 2× UltraDMA 133/100/66",
      source: "p. 9",
    },
    io: { value: "até 8 portas USB 2.0, áudio 6 canais, LAN 10/100", source: "p. 9" },
    formFactor: { value: "microATX, 24,5 × 24,5 cm", source: "p. 10" },
    highlights: [
      "Processador com conjunto de instruções de 64 bits — AMD64",
      "Comunicação processador-chipset via HyperTransport, não mais um FSB compartilhado",
      "Vídeo integrado no próprio northbridge, além do slot AGP para placa dedicada",
    ],
    investigationPoints: [
      "Note que o soquete é diferente do Socket 478 — mesma época, arquitetura diferente",
      "Procure o chip de vídeo integrado dentro do northbridge",
      "Compare a largura de banda do HyperTransport com o FSB de placas Intel da mesma época",
    ],
    images: {
      gallery: k8vmxSocket,
      explorer: k8vmxLayout,
      explorerKind: "diagram",
    },
  },
  {
    id: "ipx1800g1",
    manufacturer: "PCWare",
    model: "IPX1800G1",
    generation: 5,
    year: "~2014",
    manual: "Ficha de produto PCWare IPX1800G1",
    cpuSupport: {
      value: "Intel Celeron J1800 2,41GHz, dual-core, integrado à placa",
      source: "ficha do produto",
    },
    socket: { value: "sem soquete — CPU soldada à placa", source: "ficha do produto" },
    chipset: {
      value: "integrado ao processador (SoC) — sem northbridge/southbridge separados",
      source: "ficha do produto",
    },
    memory: {
      value: "2× SO-DIMM DDR3/DDR3L, 1333MHz, até 8GB",
      source: "ficha do produto",
    },
    expansion: { value: "1× PCI-Express x1", source: "ficha do produto" },
    storage: { value: "2× SATA2 3Gb/s", source: "ficha do produto" },
    io: {
      value: "7 portas USB (2.0/3.0), VGA, HDMI, áudio 7.1, LAN Gigabit",
      source: "ficha do produto",
    },
    formFactor: { value: "Mini-ITX, 17 × 17 cm", source: "ficha do produto" },
    highlights: [
      "CPU, GPU e chipset em um único circuito integrado (SoC)",
      "PCI Express substitui totalmente PCI e AGP como interface de expansão",
      "Placa inteira cabe num formato Mini-ITX, uma fração do tamanho da geração 1",
    ],
    investigationPoints: [
      "Tente localizar um \"northbridge\" separado — ele não existe mais",
      "Compare o tamanho físico desta placa com a da geração 1",
      "Encontre o único slot de expansão (PCIe x1) e compare com os 7 slots da Gateway",
    ],
    images: {
      gallery: ipx1800g1Topo,
      explorer: ipx1800g1Topo,
      explorerKind: "photo",
    },
  },
]

/** Par extra usado na secao de comparacao (mesmo Socket 7 da SP97-XV, form
 * factor Baby AT em vez de ATX) — nao faz parte da linha evolutiva principal. */
export const p5sbComparisonBoard: Motherboard = {
  id: "p5sb",
  manufacturer: "ASUS",
  model: "P5S-B",
  generation: 0,
  year: "1999",
  manual: "Manual ASUS P5S-B User's Manual (Super7 Baby AT)",
  cpuSupport: {
    value: "AMD K6-2/K6, Cyrix 6x86MX, Intel Pentium MMX 100–233MHz",
    source: "p. 8",
  },
  socket: { value: "Socket 7 (ZIF)", source: "p. 8" },
  chipset: {
    value: "SiS 530 (northbridge, com vídeo integrado) + SiS5595 (southbridge)",
    source: "p. 8, p. 12",
  },
  memory: { value: "3× DIMM 168 vias SDRAM PC100, até 768MB", source: "p. 8, p. 25" },
  expansion: { value: "2× ISA + 4× PCI", source: "p. 12–13" },
  storage: { value: "2× IDE Bus Master PCI, UltraDMA/66", source: "p. 8" },
  io: { value: "2 USB via bracket opcional, PS/2, paralela, 2× COM", source: "p. 8, p. 36" },
  formFactor: {
    value: "Baby AT — com conectores de alimentação AT e ATX simultâneos",
    source: "p. 6, p. 11",
  },
  highlights: [
    "Mesmo Socket 7 da SP97-XV, mas em formato Baby AT em vez de ATX",
    "Traz os dois conectores de alimentação (AT e ATX) ao mesmo tempo",
  ],
  investigationPoints: [],
  images: { gallery: p5sbTopo, explorer: p5sbLayout, explorerKind: "diagram" },
}

export function getBoard(id: string): Motherboard | undefined {
  return motherboards.find((b) => b.id === id) ?? (id === "p5sb" ? p5sbComparisonBoard : undefined)
}
