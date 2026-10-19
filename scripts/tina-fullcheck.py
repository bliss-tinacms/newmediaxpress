#!/usr/bin/env python3
"""TINA-FULLCHECK: all configured collections, backend -> public SSR verification.

The gate fails when a configured collection has no explicit check. Current required scope:
blog, page, category, user, navigation, config (Global Config).
"""
from __future__ import annotations

import json
import os
import re
import time
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

import requests

SITE = os.environ.get("SITE_URL", "").rstrip("/")
if not SITE or "localhost" in SITE.lower() or "127.0.0.1" in SITE:
    raise SystemExit("TINA-FULLCHECK BLOCKED: SITE_URL must be the public HTTPS origin")
CLIENT_ID = (os.environ.get("NEXT_PUBLIC_TINA_CLIENT_ID") or os.environ.get("TINA_CLIENT_ID") or "").strip()
BRANCH = (os.environ.get("NEXT_PUBLIC_TINA_BRANCH") or os.environ.get("TINA_BRANCH") or "main").strip()
TOKEN = os.environ.get("TINA_TOKEN", "").strip()
if not CLIENT_ID or not TOKEN:
    raise SystemExit("TINA-FULLCHECK BLOCKED: Tina client ID and token are required")

TINA_URL = f"https://content.tinajs.io/2.4/content/{CLIENT_ID}/github/{BRANCH}"
REQUIRED = {"blog", "page", "category", "user", "navigation", "config"}
SEO_FIELDS = "metaTitle metaDescription ogTitle ogDescription ogImage canonicalUrl noindex nofollow"
AUTHOR_ISLAND_GATE_ID = "AUTHOR-ISLAND-EDITABILITY-001"
AUTHOR_FIXTURE_SLUG = "donna-shelton"
EMPTY_POST_LIST_GATE_ID = "EMPTY-POST-LIST-001"
EMPTY_POST_LIST_COPY = "No published posts yet."


class DocumentParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_head = False
        self.in_title = False
        self.titles: list[str] = []
        self._title: list[str] = []
        self.metas: list[dict[str, str | None]] = []
        self.links: list[dict[str, str | None]] = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "head": self.in_head = True
        elif self.in_head and tag == "title": self.in_title, self._title = True, []
        elif self.in_head and tag == "meta": self.metas.append(values)
        elif self.in_head and tag == "link": self.links.append(values)

    def handle_endtag(self, tag):
        if tag == "title" and self.in_title:
            self.titles.append("".join(self._title).strip()); self.in_title = False
        elif tag == "head": self.in_head = False

    def handle_data(self, data):
        if self.in_title: self._title.append(data)


class CategoryBadgeParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.current: dict[str, str | list[str]] | None = None
        self.badges: list[dict[str, str]] = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        classes = str(values.get("class") or "").split()
        if tag == "a" and "ah-k__item" in classes:
            self.current = {
                "slug": str(values.get("data-category-slug") or ""),
                "href": str(values.get("href") or ""),
                "text": [],
            }

    def handle_data(self, data):
        if self.current is not None:
            text = self.current["text"]
            assert isinstance(text, list)
            text.append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self.current is not None:
            text = self.current["text"]
            assert isinstance(text, list)
            self.badges.append({
                "slug": str(self.current["slug"]),
                "href": str(self.current["href"]),
                "label": "".join(text).strip(),
            })
            self.current = None


class IslandFormParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.forms: list[dict] = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("data-tina-form") is not None:
            self.forms.append({
                "form": values.get("data-tina-form"),
                "primary": "data-tina-primary" in values,
                "island": values.get("data-tina-island"),
            })


def configured_collections() -> set[str]:
    root = Path(__file__).resolve().parents[1] / "tina" / "collections"
    found = set()
    for path in root.glob("*.ts"):
        source = path.read_text(encoding="utf-8")
        anchor = re.search(r"export\s+const\s+\w+Collection\s*:\s*Collection\s*=\s*\{", source)
        match = re.search(r"\bname\s*:\s*['\"]([^'\"]+)['\"]", source[anchor.end():]) if anchor else None
        if match: found.add(match.group(1))
    return found


def query_backend() -> dict:
    query = f"""
    query AllCollectionFullcheck {{
      blog(relativePath: "why-grocery-prices-stopped-falling-in-september.mdx") {{ title description categories seo {{ {SEO_FIELDS} }} _sys {{ filename }} }}
      blogs: blogConnection(first: 100) {{ edges {{ node {{ categories }} }} }}
      categories: categoryConnection(first: 100) {{ edges {{ node {{ title _sys {{ filename }} }} }} }}
      page(relativePath: "home.mdx") {{ title seo {{ {SEO_FIELDS} }} _sys {{ filename }} }}
      category(relativePath: "Business.json") {{ title description seo {{ {SEO_FIELDS} }} _sys {{ filename }} }}
      user(relativePath: "{AUTHOR_FIXTURE_SLUG}.json") {{ name role bio seo {{ {SEO_FIELDS} }} _sys {{ filename }} }}
      navigation(relativePath: "header.json") {{ title items {{ label href children {{ label href }} }} _sys {{ filename }} }}
      config(relativePath: "config.json") {{
        headerNavigation {{ ... on Navigation {{ _sys {{ relativePath }} }} }}
        footerNavigation {{ ... on Navigation {{ _sys {{ relativePath }} }} }}
        seo {{ title description siteOwner logo favicon footerLogo }}
        contactForm {{ heading description buttonText note subject formspreeEndpoint }}
        codeInjection {{ headerCode footerCode }}
        contactLinks {{ title link icon }}
        footerStarfield
        _sys {{ filename }}
      }}
    }}
    """
    response = requests.post(TINA_URL, headers={"X-API-KEY": TOKEN, "Content-Type": "application/json", "Accept-Encoding": "identity"}, json={"query": query}, timeout=45)
    response.raise_for_status()
    payload = response.json()
    if payload.get("errors"): raise RuntimeError(json.dumps(payload["errors"], indent=2))
    return payload["data"]


def fetch_route(path: str) -> dict:
    response = requests.get(f"{SITE}{path}{'&' if '?' in path else '?'}tina-fullcheck={time.time_ns()}", headers={"Cache-Control": "no-cache", "Pragma": "no-cache", "User-Agent": "TINA-FULLCHECK"}, timeout=45)
    response.raise_for_status()
    response.encoding = "utf-8"
    parser = DocumentParser(); parser.feed(response.text)
    return {"status": response.status_code, "cache": response.headers.get("cf-cache-status"), "html": unescape(response.text), "head": parser}


def fetch_author_island(failures: list[str]) -> dict:
    path = f"/tina-island/author?slug={AUTHOR_FIXTURE_SLUG}"
    response = requests.post(
        f"{SITE}{path}",
        headers={
            "Content-Type": "application/x-tina-preview+json",
            "X-Tina-Prime": "1",
            "Sec-Fetch-Site": "same-origin",
            "Cache-Control": "no-cache",
        },
        data="{}",
        timeout=45,
    )
    if response.status_code != 200:
        failures.append(f"{AUTHOR_ISLAND_GATE_ID}: island returned HTTP {response.status_code}")
        return {"status": response.status_code, "path": path, "formCount": 0, "primaryCount": 0, "queryLength": 0, "variables": {}, "hasUserData": False}

    parser = IslandFormParser(); parser.feed(response.text)
    primary = [item for item in parser.forms if item.get("primary") is True]
    if len(parser.forms) != 1:
        failures.append(f"{AUTHOR_ISLAND_GATE_ID}: expected exactly one author form, got {len(parser.forms)}")
    if len(primary) != 1:
        failures.append(f"{AUTHOR_ISLAND_GATE_ID}: expected exactly one primary author form, got {len(primary)}")

    form_payload: dict = {}
    if parser.forms:
        try:
            form_payload = json.loads(parser.forms[0].get("form") or "{}")
        except json.JSONDecodeError as error:
            failures.append(f"{AUTHOR_ISLAND_GATE_ID}: invalid data-tina-form JSON: {error}")
    query = str(form_payload.get("query") or "")
    raw_variables = form_payload.get("variables")
    raw_data = form_payload.get("data")
    variables: dict = raw_variables if isinstance(raw_variables, dict) else {}
    data: dict = raw_data if isinstance(raw_data, dict) else {}
    if len(query) <= 100:
        failures.append(f"{AUTHOR_ISLAND_GATE_ID}: author form query must exceed 100 characters, got {len(query)}")
    expected_relative_path = f"{AUTHOR_FIXTURE_SLUG}.json"
    if variables.get("relativePath") != expected_relative_path:
        failures.append(f"{AUTHOR_ISLAND_GATE_ID}: expected variables.relativePath={expected_relative_path!r}, got {variables!r}")
    if not isinstance(data.get("user"), dict):
        failures.append(f"{AUTHOR_ISLAND_GATE_ID}: author form contains no authoritative user data")
    return {
        "status": response.status_code,
        "path": path,
        "formCount": len(parser.forms),
        "primaryCount": len(primary),
        "queryLength": len(query),
        "variables": variables,
        "hasUserData": isinstance(data.get("user"), dict),
    }


def values(items: list[dict], key: str, name: str) -> list[str]:
    return [str(item.get("content") or "") for item in items if item.get(key) == name]


def exact_one(label: str, actual: list[str], expected: str, failures: list[str]) -> None:
    if actual != [expected]: failures.append(f"{label}: expected exactly {[expected]!r}, got {actual!r}")


def assert_text(label: str, html: str, expected: str, failures: list[str]) -> None:
    if expected and expected.casefold() not in html.casefold(): failures.append(f"{label}: backend value absent from public SSR HTML")


def category_badge(value: str) -> dict[str, str]:
    filename = str(value).replace("\\", "/").rsplit("/", 1)[-1]
    label = re.sub(r"\.(json|mdx?)$", "", filename, flags=re.I).replace("-", " ").strip()
    slug = re.sub(r"[^a-z0-9]+", "-", label.casefold()).strip("-")
    return {"label": label, "slug": slug, "href": f"/{slug}/"}


def assert_seo(label: str, route: dict, seo: dict | None, title_fallback: str, description_fallback: str, canonical_fallback: str, failures: list[str]) -> dict:
    seo = seo or {}
    title = seo.get("metaTitle") or title_fallback
    description = seo.get("metaDescription") or description_fallback
    social_title = seo.get("ogTitle") or title
    social_description = seo.get("ogDescription") or description
    canonical = urljoin(f"{SITE}/", seo.get("canonicalUrl") or canonical_fallback)
    robots = f"{'noindex' if seo.get('noindex') else 'index'}, {'nofollow' if seo.get('nofollow') else 'follow'}"
    head = route["head"]
    exact_one(f"{label}.title", head.titles, title, failures)
    exact_one(f"{label}.description", values(head.metas, "name", "description"), description, failures)
    exact_one(f"{label}.canonical", [str(x.get("href") or "") for x in head.links if "canonical" in str(x.get("rel") or "").split()], canonical, failures)
    exact_one(f"{label}.og:title", values(head.metas, "property", "og:title"), social_title, failures)
    exact_one(f"{label}.og:description", values(head.metas, "property", "og:description"), social_description, failures)
    exact_one(f"{label}.twitter:title[name]", values(head.metas, "name", "twitter:title"), social_title, failures)
    exact_one(f"{label}.twitter:description[name]", values(head.metas, "name", "twitter:description"), social_description, failures)
    exact_one(f"{label}.robots", values(head.metas, "name", "robots"), robots, failures)
    return {"title": title, "description": description, "canonical": canonical, "robots": robots}


def main() -> int:
    failures: list[str] = []
    configured = configured_collections()
    if configured != REQUIRED:
        failures.append(f"collection coverage mismatch: configured={sorted(configured)}, explicitly checked={sorted(REQUIRED)}")
    data = query_backend()
    for name in sorted(REQUIRED):
        if not data.get(name): failures.append(f"{name}: Tina query returned no document")

    assigned_category_slugs = {
        category_badge(value)["slug"]
        for edge in (data.get("blogs", {}).get("edges") or [])
        for value in ((edge.get("node") or {}).get("categories") or [])
    }
    category_nodes = [
        edge.get("node") or {}
        for edge in (data.get("categories", {}).get("edges") or [])
        if isinstance(edge, dict)
    ]
    empty_category_candidates = [
        node for node in category_nodes
        if category_badge(str((node.get("_sys") or {}).get("filename") or node.get("title") or ""))["slug"] not in assigned_category_slugs
    ]
    empty_category_candidates.sort(key=lambda node: (
        category_badge(str((node.get("_sys") or {}).get("filename") or node.get("title") or ""))["slug"] != "world-news",
        category_badge(str((node.get("_sys") or {}).get("filename") or node.get("title") or ""))["slug"],
    ))
    empty_category = empty_category_candidates[0] if empty_category_candidates else None
    empty_category_slug = category_badge(str((empty_category or {}).get("_sys", {}).get("filename") or (empty_category or {}).get("title") or ""))["slug"]

    routes = {
        "page": fetch_route("/"),
        "blog": fetch_route("/why-grocery-prices-stopped-falling-in-september/"),
        "category": fetch_route("/business/"),
        "user": fetch_route(f"/author/{AUTHOR_FIXTURE_SLUG}/"),
    }
    empty_post_list_result = {"id": EMPTY_POST_LIST_GATE_ID, "status": "FAIL", "route": None, "copy": EMPTY_POST_LIST_COPY}
    if not empty_category_slug:
        failures.append(f"{EMPTY_POST_LIST_GATE_ID}: no zero-post category fixture exists for live empty-state verification")
    else:
        empty_route_path = f"/{empty_category_slug}/"
        routes["emptyCategory"] = fetch_route(empty_route_path)
        empty_html = routes["emptyCategory"]["html"]
        marker_count = empty_html.count("data-empty-post-list")
        copy_count = empty_html.count(EMPTY_POST_LIST_COPY)
        if marker_count != 1 or copy_count != 1:
            failures.append(f"{EMPTY_POST_LIST_GATE_ID}: {empty_route_path} must render exactly one marked {EMPTY_POST_LIST_COPY!r} state; marker={marker_count}, copy={copy_count}")
        if "data-empty-post-list" in routes["category"]["html"]:
            failures.append(f"{EMPTY_POST_LIST_GATE_ID}: non-empty /business/ archive rendered the empty state")
        empty_post_list_result.update({"route": empty_route_path, "markerCount": marker_count, "copyCount": copy_count})
    author_island = fetch_author_island(failures)
    config, page, blog, category, user = data["config"], data["page"], data["blog"], data["category"], data["user"]
    site_title = config.get("seo", {}).get("title") or "New Media Xpress"
    business_post_count = sum(
        1 for edge in (data.get("blogs", {}).get("edges") or [])
        if any(str(value).replace("\\", "/").lower().endswith("/business.json") for value in ((edge.get("node") or {}).get("categories") or []))
    )
    category_description = category.get("description") or (
        f"Read the latest {category.get('title')} articles from New Media Xpress."
        if business_post_count else
        f"Articles in the {category.get('title')} category will be published soon on New Media Xpress."
    )
    seo_results = {
        "page": assert_seo("page", routes["page"], page.get("seo"), page.get("title") or site_title, config.get("seo", {}).get("description") or "", f"{SITE}/", failures),
        "blog": assert_seo("blog", routes["blog"], blog.get("seo"), blog.get("title") or "", blog.get("description") or "", "/why-grocery-prices-stopped-falling-in-september/", failures),
        "category": assert_seo("category", routes["category"], category.get("seo"), f"{category.get('title')} Articles | {site_title}", category_description, "/business/", failures),
        "user": assert_seo("user", routes["user"], user.get("seo"), f"{user.get('name')} Articles | {site_title}", user.get("bio") or f"Read the latest articles by {user.get('name')} from New Media Xpress.", f"/author/{AUTHOR_FIXTURE_SLUG}/", failures),
    }
    assert_text("blog.title", routes["blog"]["html"], blog.get("title") or "", failures)
    expected_categories = [category_badge(value) for value in (blog.get("categories") or [])]
    category_parser = CategoryBadgeParser(); category_parser.feed(routes["blog"]["html"])
    actual_categories = category_parser.badges
    if len(expected_categories) < 2:
        failures.append(f"MULTICAT-LOCK fixture must contain at least two backend categories, got {expected_categories!r}")
    if actual_categories != expected_categories:
        failures.append(f"MULTICAT-LOCK public category badges must exactly match every backend category in order: expected={expected_categories!r}, got={actual_categories!r}")
    assert_text("category.title", routes["category"]["html"], category.get("title") or "", failures)
    assert_text("user.name", routes["user"]["html"], user.get("name") or "", failures)
    assert_text("user.role", routes["user"]["html"], user.get("role") or "", failures)
    expected_island_path = f"/tina-island/author?slug={AUTHOR_FIXTURE_SLUG}"
    if expected_island_path not in routes["user"]["html"]:
        failures.append(f"{AUTHOR_ISLAND_GATE_ID}: canonical author route does not render its author island")
    assert_text("navigation.items[0].label", routes["page"]["html"], data["navigation"]["items"][0]["label"], failures)
    assert_text("config.seo.title", routes["page"]["html"], config.get("seo", {}).get("title") or "", failures)
    config_logo = config.get("seo", {}).get("logo") or ""
    if config_logo:
        assert_text("config.seo.logo", routes["page"]["html"], config_logo, failures)

    author_island["id"] = AUTHOR_ISLAND_GATE_ID
    author_island["status"] = "PASS" if not any(AUTHOR_ISLAND_GATE_ID in failure for failure in failures) else "FAIL"
    empty_post_list_result["status"] = "PASS" if not any(EMPTY_POST_LIST_GATE_ID in failure for failure in failures) else "FAIL"
    report = {"site": SITE, "gateIds": [AUTHOR_ISLAND_GATE_ID, EMPTY_POST_LIST_GATE_ID], "configuredCollections": sorted(configured), "requiredCollections": sorted(REQUIRED), "coverageComplete": configured == REQUIRED, "collections": {name: {"backendDocument": data.get(name, {}).get("_sys", {}).get("filename"), "status": "PASS" if data.get(name) else "FAIL"} for name in sorted(REQUIRED)}, "routes": {name: {"status": route["status"], "cache": route["cache"]} for name, route in routes.items()}, "islands": {"author": author_island}, "emptyPostList": empty_post_list_result, "seo": seo_results, "multicat": {"backend": expected_categories, "public": actual_categories, "exactMatch": actual_categories == expected_categories and len(expected_categories) >= 2}, "failures": failures}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"TINA_FULLCHECK_OK {not failures}")
    return 0 if not failures else 1


if __name__ == "__main__": raise SystemExit(main())
