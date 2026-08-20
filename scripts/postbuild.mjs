import { copyFile, writeFile } from 'node:fs/promises'

/**
 * GitHub Pages is a static host with no SPA rewrite. It serves 404.html for any
 * unknown path, so shipping a copy of the app shell there lets deep links like
 * /menu boot the router instead of showing a 404.
 *
 * .nojekyll stops Pages running the content through Jekyll, which would drop
 * any asset directory beginning with an underscore.
 */
await copyFile('dist/index.html', 'dist/404.html')
await writeFile('dist/.nojekyll', '')
console.log('postbuild: wrote dist/404.html and dist/.nojekyll')
