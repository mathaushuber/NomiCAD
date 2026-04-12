import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@jscad/modeling', '@jscad/stl-serializer'],
  },
})
