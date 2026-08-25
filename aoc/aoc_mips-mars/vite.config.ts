import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // base relativa: o build funciona em qualquer subpasta (GitHub Pages de
  // projeto, usuário, ou domínio próprio) sem precisar saber o caminho final
  // com antecedência nem reconfigurar se o repositório for movido/renomeado.
  base: './',
  plugins: [react(), tailwindcss()],
})
