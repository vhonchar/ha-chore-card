import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: ['src/main.ts'],
  output: {
    dir: './dist',
    format: 'es',
  },
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
      minify: true,
      tsconfig: 'tsconfig.json',
    }),
    json(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
  ],
};
