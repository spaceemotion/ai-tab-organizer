import { defineConfig } from 'tsup'

const isDev = process.argv.includes('--dev');

export default defineConfig({
  entry: [
    'src/background.ts',
    'src/options.ts',
    'src/main.css',
  ],

  watch: isDev && [
    'src/**/*',
    'public/**/*',
  ],

  publicDir: 'public',

  noExternal: [
    'zod',
    'zod-to-json-schema',
    'lodash-es',
    'ky',
  ],

  platform: 'browser',

  treeshake: true,
  splitting: false,
  clean: true,

  sourcemap: isDev,
  minify: !isDev,
})
