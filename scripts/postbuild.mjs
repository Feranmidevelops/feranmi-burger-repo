import { writeFile } from 'node:fs/promises'

/**
 * .nojekyll stops GitHub Pages running the output through Jekyll, which would
 * drop any asset directory beginning with an underscore.
 *
 * The SPA fallback (404.html), the per-route HTML files, robots.txt and
 * sitemap.xml are all emitted by the `feranmi-seo` Vite plugin, which has the
 * route table and the business data to hand.
 */
await writeFile('dist/.nojekyll', '')
console.log('postbuild: wrote dist/.nojekyll')
