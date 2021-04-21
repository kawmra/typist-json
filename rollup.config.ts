import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'lib',
      entryFileNames: 'index.js',
      format: 'cjs',
    },
    {
      dir: 'lib',
      entryFileNames: 'index.esm.js',
      format: 'esm',
    },
  ],
  plugins: [typescript()],
};
