import type { APIRoute } from 'astro';
import { listBlogs, listCategories, listPages, listUsers } from '../lib/data';

export const prerender = false;

const SITE = 'https://www.newmediaxpress.com';
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const slugOf = (value: any) => String(value?._sys?.filename || value?.permalink || '').replace(/^\/+|\/+$/g, '');
const pagePath = (page: any) => {
  const raw = String(page?.permalink || slugOf(page)).replace(/^\/+|\/+$/g, '');
  return !raw || raw === 'home' ? '/' : `/${raw}/`;
};
const blogPath = (post: any) => `/blog/${String(post?.permalink || slugOf(post)).replace(/^\/+|\/+$/g, '')}/`;

export const GET: APIRoute = async () => {
  const [pages, blogs, categories, users] = await Promise.all([listPages(), listBlogs(), listCategories(), listUsers()]);
  const entries = new Map<string, string | undefined>();
  for (const path of ['/', '/blog/', '/sitemap/', '/about/', '/our-team/', '/contact/', '/write-for-us/']) entries.set(path, undefined);
  for (const page of pages as any[]) if (!page?.seo?.noindex) entries.set(pagePath(page), page?.updatedDate);
  for (const post of blogs as any[]) if (!post?.seo?.noindex) entries.set(blogPath(post), post?.updatedDate || post?.pubDate);
  for (const category of categories as any[]) if (!category?.seo?.noindex) entries.set(`/${slugOf(category).toLowerCase()}/`, undefined);
  for (const user of users as any[]) entries.set(`/author/${slugOf(user).toLowerCase()}/`, undefined);

  const urls = [...entries.entries()]
    .filter(([path]) => path && !path.includes('//'))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, lastmod]) => `  <url>\n    <loc>${esc(new URL(path, SITE).href)}</loc>${lastmod ? `\n    <lastmod>${esc(new Date(lastmod).toISOString())}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
};
