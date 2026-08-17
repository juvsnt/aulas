import type { Motherboard } from "@/data/types"
import { hotspotsForBoard } from "@/data/hotspots"
import { HardwareHotspot } from "./HardwareHotspot"
import { Badge } from "@/components/ui/badge"

export function MotherboardExplorer({ board }: { board: Motherboard }) {
  const spots = hotspotsForBoard(board.id)

  const specRows: Array<[string, string, string]> = [
    ["Processador", board.cpuSupport.value, board.cpuSupport.source],
    ["Soquete", board.socket.value, board.socket.source],
    ["Chipset", board.chipset.value, board.chipset.source],
    ["Memória", board.memory.value, board.memory.source],
    ["Expansão", board.expansion.value, board.expansion.source],
    ["Armazenamento", board.storage.value, board.storage.source],
    ["E/S", board.io.value, board.io.source],
    ["Formato", board.formFactor.value, board.formFactor.source],
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-display text-lg font-semibold">
            {board.manufacturer} {board.model}
          </p>
          <Badge variant="outline">
            {board.images.explorerKind === "diagram" ? "diagrama do manual" : "foto real"}
          </Badge>
        </div>
        <div className="relative w-full overflow-hidden rounded-xl bg-muted">
          <img
            src={board.images.explorer}
            alt={`${board.images.explorerKind === "diagram" ? "Diagrama de layout" : "Foto"} da placa ${board.model}, com pontos interativos sobre os componentes`}
            className="w-full"
          />
          {spots.map((spot) => (
            <HardwareHotspot key={spot.id} hotspot={spot} />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Toque nos pontos para investigar cada componente. Fonte: {board.manual}.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="font-display text-base font-semibold">Ficha técnica</p>
        <dl className="mt-4 divide-y divide-border">
          {specRows.map(([label, value, source]) => (
            <div key={label} className="py-2.5">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground/90">{value}</dd>
              <dd className="mt-0.5 text-[11px] text-muted-foreground">{source}</dd>
            </div>
          ))}
        </dl>

        {board.investigationPoints.length > 0 && (
          <div className="mt-5 rounded-xl bg-secondary p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Para observar
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-secondary-foreground/90">
              {board.investigationPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
