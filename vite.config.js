import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 5173,
    host: true 
  },
  preview: {
    // Mantém a lógica da porta dinâmica para o Railway
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: true,
    // CORREÇÃO: Permite o domínio do Railway
    allowedHosts: [
      'brickprojects-production.up.railway.app'
    ]
  }
})
