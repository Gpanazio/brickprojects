import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configuração para o ambiente de desenvolvimento local
    port: process.env.PORT || 5173,
    host: true 
  },
  preview: {
    // Configuração para o ambiente de produção (Railway)
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: true,
    allowedHosts: [
      // Permite o domínio padrão do Railway (backup/teste)
      'brickprojects-production.up.railway.app',
      // Permite o seu novo subdomínio personalizado
      'originais.brick.mov'
    ]
  }
})
