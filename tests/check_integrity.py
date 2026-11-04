"""Dependency-free security and content-integrity checks for the static site."""
from pathlib import Path
import json
import re
import shutil
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
DATA = (ROOT / "assets/js/data.js").read_text()
MAIN = (ROOT / "assets/js/main.js").read_text()
PAGES = {p.name: p.read_text() for p in ROOT.glob("*.html")}
PLACEHOLDER = re.compile(r"lorem ipsum|placeholder|Group Member \d|Publication Title \d", re.I)


def gsap_version(name):
    head = (ROOT / "assets/vendor" / name).read_text()[:200]
    return re.search(r"(?:GSAP|ScrollTrigger) (\d+\.\d+\.\d+)", head).group(1)


class IntegrityChecks(unittest.TestCase):
    def test_gsap_plugin_matches_core_version(self):
        self.assertEqual(gsap_version("ScrollTrigger.min.js"), gsap_version("gsap.min.js"))

    def test_new_tab_links_use_noopener(self):
        for name, text in {**PAGES, "main.js": MAIN}.items():
            for tag in re.findall(r"<a\b[^>]*target=\"_blank\"[^>]*>", text):
                with self.subTest(file=name, tag=tag):
                    self.assertRegex(tag, r'rel="[^"]*noopener')

    def test_data_urls_use_allowed_schemes(self):
        for url in re.findall(r"(?:doi|pdf|code|href|profile|scholar|cv|github|photo|image):\s*'([^']*)'", DATA):
            with self.subTest(url=url):
                self.assertNotRegex(url, r"^\s*(?!https?:|mailto:)[a-z][a-z0-9+.-]*:")

    def test_sample_people_have_no_email(self):
        for name, email in re.findall(r"name: '(Group Member \d+)'[^}]*?email: '([^']*)'", DATA):
            with self.subTest(name=name):
                self.assertEqual(email, "")

    def test_placeholder_content_keeps_preview_notice_on(self):
        has_placeholders = any(PLACEHOLDER.search(t) for t in [DATA, *PAGES.values()])
        if has_placeholders:
            self.assertRegex(DATA, r"SEED\.PREVIEW\s*=\s*true")

    def test_contact_form_warns_against_sensitive_health_info(self):
        self.assertIn('id="f-privacy"', PAGES["join.html"])
        self.assertIn('aria-describedby="f-privacy"', PAGES["join.html"])

    @unittest.skipUnless(shutil.which("node"), "node not installed")
    def test_safe_href_blocks_script_urls(self):
        fn = re.search(r"function safeHref\(v\) \{.*?\n  \}", MAIN, re.S).group(0)
        cases = {
            "https://doi.org/10.1/x": "https://doi.org/10.1/x",
            "mailto:a@b.edu": "mailto:a@b.edu",
            "assets/cv.pdf": "assets/cv.pdf",
            "#": "",
            "": "",
            "javascript:alert(1)": "",
            " JavaScript:alert(1)": "",
            "java\tscript:alert(1)": "",
            "data:text/html,<b>x</b>": "",
        }
        script = f"{fn}\nconsole.log(JSON.stringify({json.dumps(list(cases))}.map(safeHref)))"
        out = subprocess.run(["node", "-e", script], capture_output=True, text=True, check=True).stdout
        self.assertEqual(json.loads(out), list(cases.values()))


if __name__ == "__main__":
    unittest.main()
