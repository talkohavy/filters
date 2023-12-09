import fs from 'fs';
import { defineConfig } from 'tsup';

// The options here is derived from CLI flags.
export default defineConfig((_options) => ({
  entry: ['lib/index.ts'],
  // publicDir: './lib',
  outDir: 'dist', // <--- defaults to dist
  bundle: true, // <--- defaults to true.
  format: ['esm'], // <-- If package.json type is set to module, the filenames are: [.js,.cjs], else: [.mjs, .js].
  splitting: false, // <--- defaults to true. Code splitting currently only works with the esm output format.
  treeshake: true, // <--- esbuild has tree shaking enabled by default, but sometimes it's not working very well, so tsup offers an additional option to let you use Rollup for tree shaking instead. This flag will enable Rollup for tree shaking.
  clean: true, // <--- Should clean output directory before each build?
  dts: true, // <--- Generate declaration file, meaning a index.d.ts.
  // sourcemap: true, // <-- If you don't minify you don't need sourcemaps! This will emit a ./dist/index.js.map.
  // minify: true, // <--- You can minify the output, resulting into lower bundle sizes.
  target: 'esnext', // <--- The value for target defaults to compilerOptions.target in your tsconfig.json, or node14 if unspecified. For more information check out esbuild's target option.
  // env: process.NODE_ENV,
  async onSuccess() {
    // Step 1: copy README file as-is to dist
    const readStreamReadmeMd = fs.createReadStream('./README.md');
    const writeStreamReadmeMd = fs.createWriteStream('./dist/README.md');
    readStreamReadmeMd.pipe(writeStreamReadmeMd);

    // Step 2: get the package.json file
    const packageJson = JSON.parse(fs.readFileSync('./package.json').toString());

    // Step 3: Remove all scripts
    delete packageJson.scripts;

    // Step 4: Change from private to public
    packageJson.private = false;
    packageJson.publishConfig.access = 'public';

    // Step 5: create new package.json file in dist
    fs.writeFileSync('./dist/package.json', JSON.stringify(packageJson));

    console.log('DONE !!!');
    // return () => { cleanupFunction() }
  },
}));
