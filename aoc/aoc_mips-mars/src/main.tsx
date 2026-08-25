import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// HashRouter (não BrowserRouter): o GitHub Pages é hospedagem estática, sem
// como reescrever rotas para o index.html. Com hash, o roteamento inteiro
// acontece no navegador (após o #), então funciona em qualquer subpasta do
// repositório, sobrevive a recarregar a página e a links compartilhados.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
