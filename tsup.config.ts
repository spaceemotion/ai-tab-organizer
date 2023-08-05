import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/background.ts',
    'src/options.ts',
  ],
  publicDir: 'public',

  noExternal: [
    'zod',
    'zod-to-json-schema',
    'lodash-es',
  ],

  platform: 'browser',

  treeshake: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  // minify: true,
})
