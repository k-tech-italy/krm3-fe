import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

import { resolve } from 'path';

import config from './tsconfig.json';

const ENVIRONMNET_PREFIX = 'KRM3_FE';

const alias = Object.entries(config.compilerOptions.paths).reduce((acc, [key, [value]]) => {
  const aliasKey = key.substring(0, key.length - 2);
  const path = value.substring(0, value.length - 2);
  return {
    ...acc,
    [aliasKey]: resolve(__dirname, path)
  };
}, {});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const clientEnv = loadEnv(mode, process.cwd(), ENVIRONMNET_PREFIX);

  return {
    base: process.env.BASE_URL || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias
    },
    define: {
      'process.env': { ...clientEnv, BASE_URL: process.env.BASE_URL }
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      globals: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'text-summary', 'lcov'],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/cypress/**',
          '**/.{idea,git,cache,output,temp}/**',
          '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
          '**/setupProxy.js',
          '**/tailwind.config.js',
          '**/react-app-env.d.ts',
          '**/vite-env.d.ts',
        ],
      },
    },
  };
});
  