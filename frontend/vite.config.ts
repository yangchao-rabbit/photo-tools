import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const rootPath = new URL('.', import.meta.url).pathname

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(rootPath, 'src'),
            wjs: path.resolve(rootPath, 'wailsjs'),
        },
    },
})
