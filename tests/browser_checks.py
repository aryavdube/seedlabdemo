"""Run with Python + Playwright + Chromium; no local HTTP server required."""
from pathlib import Path
import unittest

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


class BrowserChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        try:
            cls.browser = cls.playwright.chromium.launch()
        except Exception:
            cls.playwright.stop()
            raise

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        # Fonts are optional external dependencies. Keep checks offline and repeatable.
        self.context.route("https://**/*", lambda route: route.abort())
        self.page = self.context.new_page()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [], "Uncaught JavaScript errors")

    def visit(self, name, fragment=""):
        self.page.goto((ROOT / name).as_uri() + fragment)
        expect(self.page.locator(".site-header")).to_be_visible()
        expect(self.page.locator(".loader")).to_have_count(0, timeout=10000)

    def test_all_pages_at_desktop_and_mobile_sizes(self):
        for width in (1440, 390):
            for motion in ("reduce", "no-preference"):
                self.page.set_viewport_size({"width": width, "height": 1000})
                self.page.emulate_media(reduced_motion=motion)
                for path in sorted(ROOT.glob("*.html")):
                    with self.subTest(width=width, motion=motion, page=path.name):
                        self.visit(path.name)
                        expect(self.page.locator("main h1")).to_be_visible()
                        self.assertTrue(self.page.evaluate("Array.from(document.images).filter(i => i.getAttribute('src')).every(i => !i.complete || i.naturalWidth > 0)"))
                        self.assertLessEqual(self.page.evaluate("document.documentElement.scrollWidth"), width)
                        self.page.locator(".theme-btn").click()
                        expect(self.page.locator(".theme-btn")).to_have_attribute("aria-pressed", "true")
                        expect(self.page.locator("html")).to_have_attribute("data-theme", "dark")
                        self.page.locator(".theme-btn").click()
                        expect(self.page.locator(".theme-btn")).to_have_attribute("aria-pressed", "false")

    def test_skip_link(self):
        self.visit("index.html")
        self.page.keyboard.press("Tab")
        expect(self.page.locator(".skip")).to_be_focused()
        self.page.keyboard.press("Enter")
        self.assertTrue(self.page.evaluate("document.activeElement.id === 'main'"))

    def test_mobile_menu_focus_escape_and_resize(self):
        self.page.set_viewport_size({"width": 390, "height": 844})
        self.visit("index.html")
        button = self.page.locator(".menu-btn")
        expect(self.page.locator(".mobile-menu")).to_have_attribute("inert", "")
        button.click()
        expect(button).to_have_attribute("aria-expanded", "true")
        expect(self.page.locator(".mobile-menu a").first).to_be_focused()
        self.assertTrue(self.page.locator("main").evaluate("el => el.inert"))
        self.page.keyboard.press("Shift+Tab")
        expect(button).to_be_focused()
        self.page.keyboard.press("Tab")
        expect(self.page.locator(".mobile-menu a").first).to_be_focused()
        self.page.keyboard.press("Escape")
        expect(button).to_be_focused()
        expect(button).to_have_attribute("aria-expanded", "false")
        self.assertFalse(self.page.locator("main").evaluate("el => el.inert"))
        button.click()
        self.page.set_viewport_size({"width": 1440, "height": 1000})
        expect(button).to_have_attribute("aria-expanded", "false")
        expect(self.page.locator(".brand")).to_be_focused()

    def test_team_drawer_focus_and_filter(self):
        self.visit("team.html")
        drawer = self.page.locator("#drawer")
        self.assertTrue(drawer.evaluate("el => el.inert"))
        member = self.page.locator(".member").first
        member.click()
        expect(self.page.locator(".drawer-close")).to_be_focused()
        self.assertTrue(self.page.locator(".site-header").evaluate("el => el.inert"))
        self.page.keyboard.press("Shift+Tab")
        self.assertTrue(drawer.evaluate("el => el.contains(document.activeElement)"))
        self.page.keyboard.press("Tab")
        expect(self.page.locator(".drawer-close")).to_be_focused()
        self.page.keyboard.press("Escape")
        expect(member).to_be_focused()
        self.assertTrue(drawer.evaluate("el => el.inert"))
        self.assertFalse(self.page.locator(".site-header").evaluate("el => el.inert"))
        self.page.locator("#teamFilters .chip").nth(1).click()
        self.assertGreater(self.page.locator(".member.is-out").count(), 0)
        self.page.locator("#teamFilters .chip").first.click()
        expect(self.page.locator(".member.is-out")).to_have_count(0)

    def test_tabs_keyboard_and_hash_navigation(self):
        self.visit("join.html")
        first, last = self.page.locator("#tab-p"), self.page.locator("#tab-j")
        first.focus()
        for key, tab, panel in (("End", last, "panel-j"), ("Home", first, "panel-p"), ("ArrowLeft", last, "panel-j"), ("ArrowRight", first, "panel-p")):
            self.page.keyboard.press(key)
            expect(tab).to_be_focused()
            expect(tab).to_have_attribute("aria-selected", "true")
            expect(self.page.locator("#" + panel)).to_be_visible()
        self.page.evaluate("location.hash = 'positions'")
        expect(last).to_have_attribute("aria-selected", "true")
        expect(self.page.locator("#positions")).to_be_visible()
        self.visit("join.html", "#positions")
        expect(last).to_have_attribute("aria-selected", "true")

    def test_publication_search_and_clear_focus(self):
        self.visit("publications.html")
        search = self.page.locator("#pubSearch")
        initial = self.page.locator(".pub-item").count()
        self.assertGreater(initial, 0)
        search.fill("no-publication-could-match-this-query")
        expect(self.page.locator("#pubEmpty")).to_be_visible()
        self.page.locator("#pubClear").click()
        expect(search).to_be_focused()
        expect(self.page.locator(".pub-item")).to_have_count(initial)
        expect(self.page.locator("#pubEmpty")).to_be_hidden()

    def test_reduced_motion_back_to_top(self):
        self.visit("index.html")
        self.page.evaluate("window.scrollOptions = []; const original = window.scrollTo; window.scrollTo = function(options) { window.scrollOptions.push(options); return original.call(window, options); };")
        self.page.locator("[data-top]").click()
        self.assertEqual(self.page.evaluate("window.scrollOptions.at(-1).behavior"), "instant")
        expect(self.page.locator(".brand")).to_be_focused()

    def test_animation_dependency_failure_keeps_content_visible(self):
        self.context.route("**/assets/vendor/**", lambda route: route.abort())
        self.page.emulate_media(reduced_motion="no-preference")
        self.visit("team.html")
        expect(self.page.locator("html")).to_have_class("no-motion")
        self.assertEqual(self.page.locator(".member").first.evaluate("el => getComputedStyle(el).opacity"), "1")
        expect(self.page.locator(".member").first).to_be_visible()


if __name__ == "__main__":
    unittest.main(verbosity=2)
