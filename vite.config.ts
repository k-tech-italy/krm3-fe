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
    plugins: [react(), tailwindcss(),],
    resolve: {
      alias
    },
    define: {
      'process.env': { ...clientEnv, BASE_URL: process.env.BASE_URL }
    }
  };
});
  