import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.mjs',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [typescript(), terser()],
};
