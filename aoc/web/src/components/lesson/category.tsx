import { Cpu, Wrench, Split } from "lucide-react"
import type { Category } from "@/data/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const CATEGORY_LABEL: Record<Category, string> = {
  architecture: "Arquitetura",
  organization: "Organização",
  depends: "Depende",
}

export const CATEGORY_ICON: Record<Category, typeof Cpu> = {
  architecture: Cpu,
  organization: Wrench,
  depends: Split,
}

const badgeVariant: Record<Category, "arch" | "org" | "depends"> = {
  architecture: "arch",
  organization: "org",
  depends: "depends",
}

const buttonVariant: Record<Category, "arch" | "org" | "depends"> = {
  architecture: "arch",
  organization: "org",
  depends: "depends",
}

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  const Icon = CATEGORY_ICON[category]
  return (
    <Badge variant={badgeVariant[category]} className={className}>
      <Icon className="size-3" aria-hidden />
      {CATEGORY_LABEL[category]}
    </Badge>
  )
}

const CATEGORIES: Category[] = ["architecture", "organization", "depends"]

export function ClassifyButtons({
  picked,
  onPick,
  size = "default",
}: {
  picked: Category | null
  onPick: (c: Category) => void
  size?: "sm" | "default"
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Classificar">
      {CATEGORIES.map((c) => {
        const Icon = CATEGORY_ICON[c]
        const isPicked = picked === c
        return (
          <Button
            key={c}
            type="button"
            size={size}
            variant={isPicked ? buttonVariant[c] : "outline"}
            onClick={() => onPick(c)}
            aria-pressed={isPicked}
            className={cn(!isPicked && "text-foreground")}
          >
            <Icon className="size-4" aria-hidden />
            {CATEGORY_LABEL[c]}
          </Button>
        )
      })}
    </div>
  )
}
