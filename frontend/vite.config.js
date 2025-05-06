import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permitir conexiones desde la red local
    host: true,
    // No configuramos proxy ya que estamos usando datos simulados
  }
})
