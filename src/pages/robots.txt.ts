import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ site }) => {
  const base = site || new URL('https://www.newmediaxpress.com');
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /tina-content-proxy\nDisallow: /tina-island\nSitemap: ${new URL('/sitemap-index.xml', base).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
};
