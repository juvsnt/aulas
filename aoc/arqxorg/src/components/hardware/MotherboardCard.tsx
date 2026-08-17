import { ArrowRight } from "lucide-react"
import type { Motherboard } from "@/data/types"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/layout/SectionShell"

export function MotherboardCard({
  board,
  onExplore,
  delay = 0,
}: {
  board: Motherboard
  onExplore: (id: string) => void
  delay?: number
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={board.images.gallery}
            alt={`Foto da placa-mãe ${board.manufacturer} ${board.model}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-xs text-muted-foreground">
            Geração {board.generation} · {board.year}
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            {board.manufacturer} {board.model}
          </p>

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex gap-1.5">
              <dt className="shrink-0 text-muted-foreground">CPU:</dt>
              <dd className="text-foreground/90">{board.cpuSupport.value}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="shrink-0 text-muted-foreground">Memória:</dt>
              <dd className="text-foreground/90">{board.memory.value}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="shrink-0 text-muted-foreground">Expansão:</dt>
              <dd className="text-foreground/90">{board.expansion.value}</dd>
            </div>
          </dl>

          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={() => onExplore(board.id)}
          >
            Explorar placa
            <ArrowRight />
          </Button>
        </div>
      </div>
    </Reveal>
  )
}
