import { Nav } from "@/components/layout/Nav"
import { ProgressBar } from "@/components/layout/ProgressBar"
import { Hero } from "@/components/lesson/Hero"
import { ProblemSection } from "@/components/lesson/ProblemSection"
import { ConceptComparison } from "@/components/lesson/ConceptComparison"
import { DecisionTree } from "@/components/lesson/DecisionTree"
import { InvestigationFlow } from "@/components/lesson/InvestigationFlow"
import { HardwareExploration } from "@/components/hardware/HardwareExploration"
import { PairedStatements } from "@/components/lesson/PairedStatements"
import { DifficultyLevels } from "@/components/lesson/DifficultyLevels"
import { GenerationTimeline } from "@/components/hardware/GenerationTimeline"
import { MotherboardComparison } from "@/components/hardware/MotherboardComparison"
import { DependsExplanation } from "@/components/lesson/DependsExplanation"
import { InvestigationChallenge } from "@/components/investigation/InvestigationChallenge"
import { MentimeterQuestion } from "@/components/lesson/MentimeterQuestion"
import { LabPrep } from "@/components/lesson/LabPrep"
import { FinalSummary } from "@/components/lesson/FinalSummary"
import { References } from "@/components/lesson/References"

function App() {
  return (
    <>
      <ProgressBar />
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <ConceptComparison />
        <DecisionTree />
        <InvestigationFlow />
        <HardwareExploration />
        <PairedStatements />
        <DifficultyLevels />
        <GenerationTimeline />
        <MotherboardComparison />
        <DependsExplanation />
        <InvestigationChallenge />
        <MentimeterQuestion />
        <LabPrep />
        <FinalSummary />
        <References />
      </main>
    </>
  )
}

export default App
