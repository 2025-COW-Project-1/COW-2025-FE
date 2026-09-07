import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { routeOutputPath } from './prerender-lib.mjs';

const distDir = resolve(process.cwd(), 'dist');
const manifest = JSON.parse(await readFile(resolve(distDir, 'prerender-manifest.json'), 'utf8'));
const required = ['/', '/projects', '/about', '/notices'];
const samples = [
  ...required,
  manifest.routes.find((route) => /^\/projects\/[^/]+$/.test(route)),
  manifest.routes.find((route) => /^\/projects\/[^/]+\/items\/[^/]+$/.test(route)),
  manifest.routes.find((route) => /^\/notices\/[^/]+$/.test(route)),
].filter(Boolean);

for (const route of samples) {
  const html = await readFile(routeOutputPath(distDir, route), 'utf8');
  for (const marker of ['<title>', 'name="description"', 'rel="canonical"', 'property="og:title"', 'name="twitter:card"', '<h1>']) {
    if (!html.includes(marker)) throw new Error(`Missing ${marker} in ${route}`);
  }
  if (html.includes('localhost')) throw new Error(`Localhost metadata leaked into ${route}`);
  if (html.includes('X-Amz-') || html.includes('minio-api.mju-craft.shop')) {
    throw new Error(`Expiring storage URL leaked into ${route}`);
  }
}

for (const file of ['sitemap.xml', 'robots.txt']) {
  await readFile(resolve(distDir, file), 'utf8');
}

console.log(`prerender verification: ${samples.length} raw HTML routes, sitemap.xml, robots.txt`);
