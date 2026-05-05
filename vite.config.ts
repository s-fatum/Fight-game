import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import FullReload from 'vite-plugin-full-reload'

export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        FullReload([
            'src/store/**/*',
            'src/types/**/*',
            'src/api/**/*'
        ])
    ],
    base: '',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        hmr: true
    },
})