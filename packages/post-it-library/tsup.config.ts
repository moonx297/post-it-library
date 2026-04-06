import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  async onSuccess() {
    copyFileSync(join(root, 'src/style.css'), join(root, 'dist/style.css'));
  },
});
