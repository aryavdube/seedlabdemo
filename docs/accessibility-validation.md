# Accessibility and interaction fixes

Branch: `codex/seed-accessibility-quality`

Base: `ae286b0` on `main`.

The changes add focus containment, background isolation, Escape handling and focus restoration to the mobile menu and team drawer. Closed overlays are inert. Resizing to desktop closes the mobile menu, and keyboard focus keeps the header visible.

The join tabs support Home, End and arrow keys, and respond to fragment navigation. Skip links have focusable main targets. Publication search has a visible focus indicator, and clearing filters cancels pending search work and returns focus to the search field. The theme button exposes its pressed state. Back-to-top respects reduced motion and returns focus to the header. Content remains visible if GSAP or ScrollTrigger fails to load.

The patch retains the existing layout, colors, typography, imagery and content. Visual comparison remains pending.

## Validation on 2026-10-24

Passed:

- `python3 tests/check_site.py`: all six HTML pages have one main landmark, one title, unique IDs and valid local resource/fragment references.
- `node --check assets/js/main.js`
- `node --check assets/js/data.js`
- `python3 -m py_compile tests/check_site.py tests/browser_checks.py`
- `git diff --check`

Blocked:

- The sandbox denies binding a local HTTP server socket: `PermissionError: [Errno 1] Operation not permitted`.
- The browser suite was attempted with the installed Playwright 1.55.0 and Chromium headless shell. Chromium exits during launch with `sandbox_host_linux.cc:41` and `shutdown: Operation not permitted (1)`. **Zero browser tests ran.**

Run the browser checks using the README commands in an environment that permits Chromium. Review the six pages with production fonts at desktop and mobile sizes, in both themes, before opening the draft PR. Browser checks block external fonts and do not establish visual parity or WCAG conformance.

## Draft PR text

Title: Improve keyboard access and interaction reliability

The mobile menu and team drawer previously allowed focus to leave the overlay. This change contains focus, makes background content inert, restores the opening control on close, and closes the mobile menu when resizing to desktop.

It also completes tab keyboard navigation and fragment handling, exposes theme state, makes publication search focus visible, restores search focus after clearing filters, and respects reduced motion when returning to the top. Main landmarks can receive skip-link focus, and content stays visible if the animation dependencies fail to load. Existing visual styling is retained.

Static page/resource checks, JavaScript syntax checks and whitespace checks pass. Browser tests are included but could not run because the local sandbox prevents Chromium from launching. Desktop/mobile browser checks and visual review are pending.

## Publication status

No branch was pushed and no PR was opened. The GitHub connector reports `push: false` for `aryavdube/seedlabdemo`; `Cyberchopin/seedlabdemo` is unavailable to the connector. The local GitHub CLI reports invalid credentials. Browser validation is also required before opening the draft PR. The maintainer's `main` branch has not been modified.
