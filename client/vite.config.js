/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const workspaceModules = path.resolve(__dirname, './node_modules/@embedding-atlas/workspace/node_modules');
const umapWasmPath = path.resolve(__dirname, './node_modules/@embedding-atlas/workspace/packages/umap-wasm');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'embedding-atlas/react': path.resolve(workspaceModules, 'embedding-atlas/dist/react.js'),
      'embedding-atlas': path.resolve(workspaceModules, 'embedding-atlas'),
      '@embedding-atlas/umap-wasm': umapWasmPath,
      '@uwdata/mosaic-core': path.resolve(workspaceModules, '@uwdata/mosaic-core'),
      '@uwdata/mosaic-spec': path.resolve(workspaceModules, '@uwdata/mosaic-spec'),
      '@uwdata/mosaic-sql': path.resolve(workspaceModules, '@uwdata/mosaic-sql'),
      '@uwdata/vgplot': path.resolve(workspaceModules, '@uwdata/vgplot'),
      '@duckdb/duckdb-wasm': path.resolve(workspaceModules, '@duckdb/duckdb-wasm'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/sync': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
