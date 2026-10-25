import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: { postcss: {} },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'blockly', test: /node_modules[\\/]blockly/ },
            { name: 'three', test: /node_modules[\\/]three/ },
          ],
        },
      },
    },
  },
})
