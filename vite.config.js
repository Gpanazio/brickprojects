import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 5173, // Usa a porta do Railway ou 5173 localmente
    host: true // Necessário para expor a rede no Docker/Railway
  },
  preview: {
    port: 4173, // Define a porta fixa 4173 para o preview
    host: true
  }
})
