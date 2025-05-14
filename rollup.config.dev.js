import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: ['src/main.ts'],
  output: {
    file: 'dist/chore-card.js',
    format: 'es',
  },
  external: (id) => id.startsWith('@home-assistant/frontend'),
  plugins: [
    resolve({
      browser: true,
      extensions: ['.js', '.ts'],
      preferBuiltins: false,
      dedupe: ['lit'],
    }),
    commonjs(),
    esbuild({
      target: 'es2020',
      jsx: 'automatic',
      minify: false,
      tsconfig: 'tsconfig.json',
    }),
    json(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
    serve({
      contentBase: './dist',
      host: '0.0.0.0',
      port: 5000,
      allowCrossOrigin: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
  ],
  watch: {
    chokidar: {
      usePolling: true,
      interval: 100,
    },
    clearScreen: false,
  },
};
