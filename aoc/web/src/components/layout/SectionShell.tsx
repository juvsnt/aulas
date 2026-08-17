import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SectionShellProps {
  id: string
  children: React.ReactNode
  className?: string
  tone?: "default" | "dark" | "muted"
  narrow?: boolean
}

const toneClasses: Record<NonNullable<SectionShellProps["tone"]>, string> = {
  default: "bg-background text-foreground",
  dark: "bg-primary text-primary-foreground",
  muted: "bg-secondary text-secondary-foreground",
}

export function SectionShell({
  id,
  children,
  className,
  tone = "default",
  narrow = false,
}: SectionShellProps) {
  return (
    <section
      id={id}
      tabIndex={-1}
      className={cn(
        "scroll-mt-20 px-6 py-20 sm:px-10 sm:py-28",
        toneClasses[tone],
        className
      )}
      aria-label={id}
    >
      <div className={cn("mx-auto w-full", narrow ? "max-w-3xl" : "max-w-6xl")}>
        {children}
      </div>
    </section>
  )
}

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/** Reveal simples ao entrar na viewport - usa Framer Motion, respeita
 * prefers-reduced-motion via MotionConfig no root da aplicacao. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  )
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2 className={cn("text-3xl font-semibold leading-tight sm:text-4xl", className)}>
      {children}
    </h2>
  )
}
