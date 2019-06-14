import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'demos/game/index.ts',
  output: {
    name: 'bundle',
    file: 'demo/build.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    resolve({
      extensions: ['.js', '.ts']
    }),
    typescript({
      sourceMap: true,
    }),
  ]
}