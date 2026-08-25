import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Intro from './routes/Intro'
import Ia32Concepts from './routes/Ia32Concepts'
import Ia32Examples from './routes/Ia32Examples'
import Encoding from './routes/Encoding'
import MipsConcepts from './routes/MipsConcepts'
import MipsExamples from './routes/MipsExamples'
import Comparator from './routes/Comparator'
import Lab from './routes/Lab'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/ia32" element={<Ia32Concepts />} />
        <Route path="/ia32/exemplos" element={<Ia32Examples />} />
        <Route path="/codificacao" element={<Encoding />} />
        <Route path="/mips" element={<MipsConcepts />} />
        <Route path="/mips/exemplos" element={<MipsExamples />} />
        <Route path="/comparador" element={<Comparator />} />
        <Route path="/laboratorio" element={<Lab />} />
      </Routes>
    </Layout>
  )
}
