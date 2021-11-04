import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      name: 'frontend-core',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
