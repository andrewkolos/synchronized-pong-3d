import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default {
  input: 'demos/game/index.ts',
  output: {
    name: 'bundle',
    file: 'demos/game/index.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    json(),
    resolve({
      extensions: ['.js', '.ts']
    }),
    typescript({
      tsconfig: "tsconfig.json",
      sourceMap: true,
    }),
  ]
}