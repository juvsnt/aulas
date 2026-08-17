import { motion } from "framer-motion"
import { ArrowDown, SearchCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLessonProgress } from "@/context/LessonProgressContext"
import heroImage from "@/assets/boards/p4v800x/topo.jpeg"

export function Hero() {
  const { goToSection } = useLessonProgress()

  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center overflow-hidden bg-primary text-primary-foreground"
      aria-label="Abertura"
    >
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/90 to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(91,155,213,0.35),transparent_45%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-6 py-32 sm:px-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-primary-foreground/70"
        >
          <SearchCode className="size-4" aria-hidden />
          Laboratório de Arquitetura e Organização de Computadores
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl font-display text-5xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl"
        >
          Arquitetura ou Organização?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg text-primary-foreground/80 sm:text-xl"
        >
          Aprenda a investigar decisões de projeto observando placas-mãe
          reais.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Button
            size="lg"
            variant="arch"
            onClick={() => goToSection("problem")}
            className="group"
          >
            Iniciar investigação
            <ArrowDown className="transition-transform group-hover:translate-y-0.5" />
          </Button>
          <p className="text-sm text-primary-foreground/60">
            5 gerações de hardware real · manuais originais do laboratório
          </p>
        </motion.div>
      </div>
    </section>
  )
}
