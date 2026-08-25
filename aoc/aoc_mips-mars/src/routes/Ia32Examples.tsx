import ExamplesListPage from '../components/ExamplesListPage'

export default function Ia32Examples() {
  return (
    <ExamplesListPage
      isa="ia32"
      kicker="Módulo 3"
      title="De C a IA-32, instrução por instrução"
      subtitle="Dez microprogramas progressivos. Para cada um, avance instrução por instrução e observe: qual dado está sendo manipulado, onde ele está, quais registradores mudam e se há acesso à RAM."
    />
  )
}
