import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';

export default [
  {
    input: 'dist/esm/src/index.js',
    output: [
      {
        file: 'dist/plugin.js',
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: 'dist/plugin.cjs.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: false,
      }),
      esbuild({
        minify: true,
        target: 'es2022',
      }),
    ],
    external: ['@capacitor/core'],
  },
];