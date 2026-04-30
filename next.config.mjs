import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createMDX from '@next/mdx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-gfm', {}]],
    rehypePlugins: [
      ['rehype-slug', {}],
      ['rehype-autolink-headings', { behavior: 'wrap', properties: { className: ['heading-anchor'] } }],
      ['@shikijs/rehype', { themes: { light: 'github-light', dark: 'github-dark-dimmed' } }],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  turbopack: {
    root: __dirname,
  },
};

export default withMDX(nextConfig);
