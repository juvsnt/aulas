export type Category = "architecture" | "organization" | "depends"

export interface SpecField {
  value: string
  source: string
}

export interface Motherboard {
  id: string
  manufacturer: string
  model: string
  generation: number
  year: string
  manual: string
  cpuSupport: SpecField
  socket: SpecField
  chipset: SpecField
  memory: SpecField
  expansion: SpecField
  storage: SpecField
  io: SpecField
  formFactor: SpecField
  highlights: string[]
  investigationPoints: string[]
  images: {
    gallery: string
    explorer: string
    explorerKind: "diagram" | "photo"
  }
}

export interface Hotspot {
  id: string
  boardId: string
  label: string
  x: number
  y: number
  category: Category
  question: string
  explanation: string
  archNote?: string
  orgNote?: string
  source: string
}

export interface PairedStatement {
  id: string
  boardId: string
  specific: string
  specificCategory: Category
  specificReason: string
  general: string
  generalCategory: Category
  generalReason: string
  source: string
}

export interface ChallengeCase {
  id: string
  level: 1 | 2 | 3
  boardId: string
  evidence: string
  category: Category
  reason: string
  archNote?: string
  orgNote?: string
  source: string
}

export interface MentimeterQuestion {
  id: string
  prompt: string
  controversial?: boolean
}

export interface ConceptQuote {
  id: string
  quote: string
  source: string
  note?: string
}
