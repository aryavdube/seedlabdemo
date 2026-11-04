"""Dependency-free checks for the static site's pages and local resources."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import unittest

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.resources, self.mains, self.titles = [], [], 0, 0
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        self.mains += tag == "main"
        self.titles += tag == "title"
        for key in ("src", "href"):
            if attrs.get(key):
                self.resources.append(attrs[key])


class SiteChecks(unittest.TestCase):
    def test_pages_and_resources(self):
        pages = {path: Page(path) for path in ROOT.glob("*.html")}
        self.assertEqual(len(pages), 6)
        for path, page in pages.items():
            with self.subTest(page=path.name):
                self.assertEqual(page.mains, 1)
                self.assertEqual(page.titles, 1)
                self.assertIn("main", page.ids)
                self.assertEqual(len(page.ids), len(set(page.ids)), "duplicate IDs")
                for resource in page.resources:
                    url = urlsplit(resource)
                    if url.scheme or url.netloc:
                        continue
                    target = (path.parent / unquote(url.path)).resolve() if url.path else path
                    self.assertTrue(target.is_relative_to(ROOT), resource)
                    self.assertTrue(target.is_file(), f"{path.name}: {resource}")
                    if url.fragment and target in pages:
                        self.assertIn(unquote(url.fragment), pages[target].ids, resource)


if __name__ == "__main__":
    unittest.main()
