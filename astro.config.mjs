// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import partytown from '@astrojs/partytown';

// Open external links in markdown (posts, talk notes, project write-ups) in a
// new tab.
function rehypeExternalLinks() {
  /** @param {any} node */
  const visit = (node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      /^https?:\/\//.test(String(node.properties?.href ?? ''))
    ) {
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
    }
    node.children?.forEach(visit);
  };
  return (/** @type {any} */ tree) => visit(tree);
}

// https://astro.build/config
export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeExternalLinks],
  },
  redirects: {
    '/portfolio': '/projects',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
});
