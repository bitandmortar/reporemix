/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const atlasSourcePackagesPath = path.resolve(__dirname, '../../embedding-atlas-main/packages');
const atlasNodeModulesPackagesPath = path.resolve(
  __dirname,
  './node_modules/@embedding-atlas/workspace/packages',
);
const atlasPackagesPath = fs.existsSync(
  path.resolve(atlasSourcePackagesPath, 'embedding-atlas/dist/react.js'),
)
  ? atlasSourcePackagesPath
  : atlasNodeModulesPackagesPath;
const atlasEmbeddingDistPath = path.resolve(atlasPackagesPath, 'embedding-atlas/dist');
const umapWasmPath = path.resolve(atlasPackagesPath, 'umap-wasm');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'embedding-atlas/react': path.resolve(atlasEmbeddingDistPath, 'react.js'),
      'embedding-atlas': path.resolve(atlasEmbeddingDistPath, 'index.js'),
      '@embedding-atlas/umap-wasm': umapWasmPath,
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
