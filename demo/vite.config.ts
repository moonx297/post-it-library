import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const dir = path.dirname(fileURLToPath(import.meta.url));
const libRoot = path.resolve(dir, '../packages/post-it-library');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5188,
    strictPort: true,
  },
  resolve: {
    alias: [
      { find: 'post-it-library/style.css', replacement: path.join(libRoot, 'src/style.css') },
      { find: 'post-it-library', replacement: path.join(libRoot, 'src/index.ts') },
    ],
  },
});
