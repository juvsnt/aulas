export interface SectionMeta {
  id: string
  label: string
  inNav?: boolean
}

/** Ordem narrativa completa da pagina, usada pela barra de progresso e pela
 * navegacao por teclado do modo apresentacao. */
export const SECTION_ORDER: SectionMeta[] = [
  { id: "hero", label: "Início" },
  { id: "problem", label: "O problema" },
  { id: "concept", label: "Conceito", inNav: true },
  { id: "decision-tree", label: "Regra de decisão" },
  { id: "method", label: "Método", inNav: true },
  { id: "gallery", label: "Placas", inNav: true },
  { id: "explorer", label: "Explorador" },
  { id: "paired-statements", label: "Pares de afirmações" },
  { id: "difficulty-levels", label: "Desafios", inNav: true },
  { id: "timeline", label: "Evolução", inNav: true },
  { id: "comparison", label: "Comparação" },
  { id: "depends", label: "Quando é Depende" },
  { id: "investigation-mode", label: "Sua vez de investigar" },
  { id: "mentimeter", label: "Vamos decidir juntos" },
  { id: "lab-prep", label: "Prática", inNav: true },
  { id: "summary", label: "Síntese" },
  { id: "references", label: "Referências" },
]

export const NAV_ITEMS = SECTION_ORDER.filter((s) => s.inNav)
