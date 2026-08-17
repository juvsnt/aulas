import { motherboards } from "@/data/motherboards"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"

const evolutionFields: Array<{ label: string; values: string[] }> = [
  { label: "Slots", values: ["ISA + PCI", "ISA + PCI", "AGP + PCI", "AGP + PCI", "PCIe"] },
  { label: "Memória", values: ["SIMM", "SIMM / DIMM", "DDR", "DDR", "DDR3"] },
  { label: "Armazenamento", values: ["IDE", "IDE", "IDE + SATA", "IDE + SATA", "SATA"] },
  { label: "Chipset", values: ["chip único", "chip único", "North + South", "North + South (IGP)", "SoC integrado"] },
]

export function GenerationTimeline() {
  return (
    <SectionShell id="timeline">
      <Reveal>
        <Kicker>A evolução diante dos seus olhos</Kicker>
        <SectionHeading className="max-w-2xl">Cinco gerações, vinte anos.</SectionHeading>
      </Reveal>

      <div className="mt-10 -mx-6 overflow-x-auto px-6 pb-4 sm:mx-0 sm:px-0">
        <div className="relative flex min-w-max gap-6 sm:min-w-0 sm:grid sm:grid-cols-5">
          <div className="absolute left-0 right-0 top-9 hidden h-px bg-border sm:block" aria-hidden />
          {motherboards.map((board, i) => (
            <Reveal key={board.id} delay={i * 0.08} className="w-56 shrink-0 sm:w-auto">
              <div className="relative flex flex-col items-center text-center">
                <div className="z-10 flex size-[18px] items-center justify-center rounded-full border-4 border-background bg-primary" />
                <p className="mt-3 font-mono text-xs text-muted-foreground">{board.year}</p>
                <div className="mt-2 aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <img
                    src={board.images.gallery}
                    alt={`${board.manufacturer} ${board.model}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 text-sm font-semibold">{board.model}</p>
                <p className="mt-1 text-xs text-muted-foreground">{board.highlights[0]}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.2} className="mt-14 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="p-3 text-left font-medium">Campo</th>
              {motherboards.map((b) => (
                <th key={b.id} className="p-3 text-left font-medium">
                  {b.model}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evolutionFields.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-card" : "bg-secondary"}>
                <td className="p-3 font-medium text-muted-foreground">{row.label}</td>
                {row.values.map((v, j) => (
                  <td key={j} className="p-3">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <Reveal delay={0.25} className="mt-10 text-center">
        <p className="mx-auto max-w-2xl font-display text-xl font-semibold sm:text-2xl">
          O que mudou porque a arquitetura evoluiu — e o que mudou porque
          encontramos novas formas de organizar o computador?
        </p>
      </Reveal>
    </SectionShell>
  )
}
