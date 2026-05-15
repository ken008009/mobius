import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@app': path.join(__dirname, './src'),
      '@assets': path.join(__dirname, './src/assets'),
      '@images': path.join(__dirname, './src/assets/images'),
      '@styles': path.join(__dirname, './src/assets/styles'),
      '@components': path.join(__dirname, './src/components'),
      '@constants': path.join(__dirname, './src/constants'),
      '@utils': path.join(__dirname, './src/utils'),
      '@tools': path.join(__dirname, './src/tools'),
      '@pages': path.join(__dirname, './src/pages'),
      '@services': path.join(__dirname, './src/services'),
      '@libs': path.join(__dirname, './src/libs'),
      '@methods': path.join(__dirname, './src/methods'),
      '@redux': path.join(__dirname, './src/redux'),
      '@layers': path.join(__dirname, './src/layers'),
      '@router': path.join(__dirname, './src/router'),
      '@store': path.join(__dirname, './src/store')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    host: true,
    port: 5113
  }
})
