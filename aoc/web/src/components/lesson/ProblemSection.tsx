import { useState } from "react"
import { motion } from "framer-motion"
import { SectionShell, Reveal, Kicker, SectionHeading } from "@/components/layout/SectionShell"
import { cn } from "@/lib/utils"

const traits = [
  "4 slots PCI",
  "suporte ao padrão PCI",
  "Socket 7",
  "compatibilidade com a família Pentium",
  "512 KB de cache L2",
  "conjunto de instruções x86",
]

export function ProblemSection() {
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <SectionShell id="problem" tone="muted">
      <Reveal>
        <Kicker>O problema</Kicker>
        <SectionHeading className="max-w-2xl">
          Estas seis características parecem semelhantes.
        </SectionHeading>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {traits.map((trait, i) => (
          <motion.button
            key={trait}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            onClick={() => setPicked(trait)}
            className={cn(
              "rounded-xl border border-border bg-card p-5 text-left font-medium shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
              picked === trait && "ring-2 ring-arch"
            )}
          >
            {trait}
          </motion.button>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-14 text-center">
        <p className="font-display text-2xl font-semibold sm:text-3xl">
          Tudo isso pertence à mesma categoria?
        </p>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Algumas são claramente uma coisa. Outras dependem de como você
          formula a pergunta. Vamos aprender a diferença observando placas
          reais.
        </p>
      </Reveal>
    </SectionShell>
  )
}
