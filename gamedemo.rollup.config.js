import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import commonJS from 'rollup-plugin-commonjs';

export default {
  input: 'demo/index.ts',
  output: {
    name: 'index',
    file: 'demo/index.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    json(),
    commonJS({
      include: 'node_modules/**',
    }),
    resolve({
      extensions: ['.js', '.ts'],
    }),
    typescript({
      tsconfig: 'tsconfig.json',
      sourceMap: true,
    }),
  ],
};
