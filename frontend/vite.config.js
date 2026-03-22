import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium' // <-- Importe o plugin aqui

export default defineConfig({
    plugins: [
        react(),
        cesium() // <-- Adicione ele na lista de plugins
    ],
})