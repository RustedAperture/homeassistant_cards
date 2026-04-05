import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/severity-bar-card.ts',
      formats: ['es'],
      fileName: 'severity-bar-card',
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
