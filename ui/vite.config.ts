import { join } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import cssInjectByJs from 'vite-plugin-css-injected-by-js'
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers'
// import { TDesignResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': join(__dirname, './src'),
    },
  },
  build: {
    watch: {
      include: 'src/**',
    },
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['/scripts/app.js', '/scripts/api.js'],
      input: {
        input: 'main.js',
      },
      output: {
        globals: {
          app: 'app',
          api: 'api',
          Litegraph: 'Litegraph',
        },
        dir: '../dist',
        assetFileNames: '[name][extname]',
        entryFileNames: 'comfyui-manager.js',
      },
    },
  },
  plugins: [
    vueJsx(),
    vue({
      script: {
        defineModel: true,
      },
    }),
    AutoImport({
      imports: ['vue'],
      resolvers: [
        // TDesignResolver({
        //   library: 'vue-next',
        // }),
        PrimeVueResolver(),
      ],
    }),
    Components({
      dts: true,
      deep: true,
      resolvers: [PrimeVueResolver()],
    }),
    cssInjectByJs(),
  ],
})
