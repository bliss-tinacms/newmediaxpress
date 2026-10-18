#!/usr/bin/env python3
import base64
import hashlib
import json
import mimetypes
import re
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright

SOURCE = Path('/home/aaisha/.hermes/cache/documents')
OUT = Path('/tmp/newmediaxpress-mockups-rendered')
FILES = {
    'home': 'doc_3c74f9f6b385_index.html',
    'category': 'doc_6fb84cd4dc48_category.html',
    'author': 'doc_08d45c2df470_author.html',
    'article': 'doc_c165a4ea526e_article.html',
    'about': 'doc_2e14bbe59c0c_about.html',
    'notfound': 'doc_b6dc1b756cfb_404.html',
    'sitemap': 'doc_25c6a46e71ca_sitemap.html',
    'team': 'doc_43bb41341891_team.html',
    'page': 'doc_1a117c85bd6e_page.html',
    'contact': 'doc_ab3811d45c60_contact.html',
}
MIME_EXT = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
    'image/svg+xml': '.svg', 'image/gif': '.gif', 'font/woff2': '.woff2',
    'font/woff': '.woff', 'font/ttf': '.ttf', 'application/font-woff': '.woff',
}

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    assets_dir = OUT / 'assets'
    assets_dir.mkdir(exist_ok=True)
    handler = lambda *a, **kw: Quiet(*a, directory=str(SOURCE), **kw)
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{server.server_port}'
    all_assets = {}
    reports = {}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            for page_name, filename in FILES.items():
                page_dir = OUT / page_name
                page_dir.mkdir(exist_ok=True)
                page = browser.new_page(viewport={'width': 1440, 'height': 1200}, device_scale_factor=1)
                errors = []
                page.on('console', lambda msg, errors=errors: errors.append(f'console:{msg.type}:{msg.text}') if msg.type == 'error' else None)
                page.on('pageerror', lambda exc, errors=errors: errors.append(f'pageerror:{exc}'))
                page.goto(f'{base}/{quote(filename)}', wait_until='domcontentloaded', timeout=120000)
                page.wait_for_function("!document.querySelector('#__bundler_loading')", timeout=120000)
                page.wait_for_timeout(1000)
                page.screenshot(path=str(page_dir / 'desktop-1440.png'), full_page=True)
                html = page.content()
                (page_dir / 'rendered.html').write_text(html)
                details = page.evaluate(r"""() => {
                  const all = [...document.querySelectorAll('*')];
                  const urls = new Set();
                  for (const el of all) {
                    if (el.currentSrc) urls.add(el.currentSrc);
                    if (el.src) urls.add(el.src);
                    const bg = getComputedStyle(el).backgroundImage;
                    for (const m of bg.matchAll(/url\\([\"']?([^\"')]+)[\"']?\\)/g)) urls.add(m[1]);
                  }
                  const classes = [...new Set(all.flatMap(el => [...el.classList]))].sort();
                  const sheets = [...document.styleSheets].map(s => {
                    try { return [...s.cssRules].map(r => r.cssText).join('\n'); } catch { return ''; }
                  }).join('\n');
                  return {
                    title: document.title,
                    bodyClass: document.body.className,
                    classes,
                    css: sheets,
                    urls: [...urls].filter(Boolean),
                    text: document.body.innerText,
                    width: document.documentElement.scrollWidth,
                    height: document.documentElement.scrollHeight,
                    headerCount: document.querySelectorAll('header').length,
                    footerCount: document.querySelectorAll('footer').length,
                    topChildren: [...document.body.children].map(x => ({tag:x.tagName, id:x.id, cls:x.className}))
                  };
                }""")
                (page_dir / 'styles.css').write_text(details.pop('css'))
                (page_dir / 'body.txt').write_text(details.pop('text'))
                asset_rows = []
                for url in details.pop('urls'):
                    if not (url.startswith('blob:') or url.startswith('data:')):
                        continue
                    try:
                        record = page.evaluate("""async (url) => {
                          const r = await fetch(url); const b = new Uint8Array(await r.arrayBuffer());
                          let s=''; for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode(...b.subarray(i,i+0x8000));
                          return {mime:r.headers.get('content-type') || '', b64:btoa(s)};
                        }""", url)
                        raw = base64.b64decode(record['b64'])
                        digest = hashlib.sha256(raw).hexdigest()
                        mime = record['mime'].split(';')[0]
                        ext = MIME_EXT.get(mime) or mimetypes.guess_extension(mime) or '.bin'
                        target = assets_dir / f'{digest}{ext}'
                        if not target.exists(): target.write_bytes(raw)
                        row = {'page': page_name, 'url': url, 'mime': mime, 'bytes': len(raw), 'sha256': digest, 'path': str(target)}
                        asset_rows.append(row); all_assets[digest] = row
                    except Exception as exc:
                        asset_rows.append({'page': page_name, 'url': url, 'error': str(exc)})
                (page_dir / 'assets.json').write_text(json.dumps(asset_rows, indent=2))
                details['errors'] = errors
                details['assetCount'] = len(asset_rows)
                reports[page_name] = details
                page.close()
                mobile = browser.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
                mobile.goto(f'{base}/{quote(filename)}', wait_until='domcontentloaded', timeout=120000)
                mobile.wait_for_function("!document.querySelector('#__bundler_loading')", timeout=120000)
                mobile.wait_for_timeout(500)
                mobile.screenshot(path=str(page_dir / 'mobile-390.png'), full_page=True)
                reports[page_name]['mobileWidth'] = mobile.evaluate('document.documentElement.scrollWidth')
                reports[page_name]['mobileHeight'] = mobile.evaluate('document.documentElement.scrollHeight')
                mobile.close()
            browser.close()
    finally:
        server.shutdown()
    (OUT / 'report.json').write_text(json.dumps(reports, indent=2))
    (OUT / 'asset-manifest.json').write_text(json.dumps(list(all_assets.values()), indent=2))
    print(json.dumps({'output': str(OUT), 'pages': len(reports), 'uniqueAssets': len(all_assets), 'reports': reports}, indent=2))

if __name__ == '__main__':
    main()
