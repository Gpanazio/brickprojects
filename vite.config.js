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
    // AQUI ESTAVA O ERRO: A porta estava fixa em 4173.
    // Agora, ela ouvirá a porta do Railway (process.env.PORT) 
    // ou cairá para 4173 apenas se não houver variável definida.
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: true
  }
})
