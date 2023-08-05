import { defineConfig } from 'tsup'
import { existsSync, statSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join } from 'node:path';

const isDev = process.argv.includes('--dev');

function copyRecursiveSync(src: string, dest: string) {
  const exists = existsSync(src);
  const stats = exists && statSync(src);
  const isDirectory = stats && stats.isDirectory();

  if (exists && isDirectory) {
    mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(join(src, childItemName), join(dest, childItemName));
    });
  } else {
    copyFileSync(src, dest);
  }
}

export default defineConfig({
  entry: [
    'src/background.ts',
    'src/options.ts',
    'src/main.css',
  ],

  watch: isDev,

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


  // WORKAROUND for https://github.com/egoist/tsup/issues/831
  onSuccess: isDev ? async () => {
    copyRecursiveSync('public', 'dist');
  } : undefined,
})
