# Security & content-integrity audit

Scope: every page, `assets/js/main.js`, `assets/js/data.js` and `assets/vendor/*`, on `main` at `ae286b0`.
The site is static (GitHub Pages) with no backend, cookies, analytics or stored user data, so the attack
surface is small. Each item below is marked **confirmed**, **hardening** (defence in depth, nothing
exploitable today) or **no issue**.

## Findings

| # | Area | Status | Finding | This PR |
|---|------|--------|---------|---------|
| 1 | Placeholder content | **confirmed** (credibility) | The live site shows sample people ("Group Member 1–11"), "Publication Title 1–12", dated news ("lab receives new funding"), a "Recruiting" study and four "Open" positions, all placeholders. Nothing tells visitors this is a preview. | Adds a dismissible site-wide preview notice controlled by `SEED.PREVIEW` in `data.js`. Content itself is left for the lab to supply. |
| 2 | Sample emails | **confirmed** | Sample members had `member1@ucla.edu` … `member6@ucla.edu`. These are on a real university domain, so a visitor's email could reach an unrelated person. | Cleared to `''` (the drawer already hides empty emails). |
| 3 | Contact form privacy | **confirmed** (participant-facing) | "Family interested in a study" is a form option, and the form sends via plain email. There was no guidance to avoid sharing a child's health information. | Adds a short note under the message field (linked with `aria-describedby`). The wording should be checked by the PI/IRB. |
| 4 | `innerHTML` rendering | **no issue** | All data-driven strings go through `esc()` before going into HTML. `bold()` escapes first and then only adds `<b>`. No user input is rendered. | No change. |
| 5 | URLs from `data.js` | **hardening** | `esc()` blocks breaking out of attributes but not a `javascript:` URL. Today this could only happen through a typo by whoever edits `data.js`. | `safeHref()` allows only relative, `http(s):` and `mailto:` URLs (control characters stripped first) and runs once when the data loads. |
| 6 | Dead `#` links | **confirmed** (quality) | Every publication's DOI/PDF/Code and every member profile link was `#`. | Placeholder `#` links in `data.js` are no longer rendered, so they reappear as soon as real URLs are filled in. Static `href="#"` remain in `publications.html` (Google Scholar) and `research.html` (two "Learn more"); listed for the lab. |
| 7 | External links | **no issue** | The only `target="_blank"` link (Semel page) has `rel="noopener"`. | Regression test added. |
| 8 | Third-party scripts | **no issue** | GSAP 3.13.0, ScrollTrigger 3.13.0 and Lenis 1.3.4 are self-hosted and byte-identical to the npm releases (checked against `npm pack` tarballs; the tarball sha512 matches the registry). There's no CDN dependency, so SRI isn't needed. | Regression test that ScrollTrigger matches the core GSAP version. |
| 9 | Third-party fonts | note | Fontshare and Google Fonts are loaded from their CDNs, which lets those providers see visitor IPs. That's acceptable for a public lab site; self-hosting is an option later. | No change. |
| 10 | `window.name` state | **no issue** | Only theme and nav flags are kept, read with `JSON.parse` inside `try`, and never rendered as HTML. | No change. |

## Left for the lab / a later PR

- Replace the placeholder content, then set `SEED.PREVIEW = false`. `tests/check_integrity.py` fails if
  placeholder text remains while the notice is off.
- Confirm the funder list (NIMH, BBRF) before it is shown as real.
- Fill in or remove the static `href="#"` links listed in item 6.
- SEO/performance (absolute `og:image`, canonical URLs, image sizes): suggested for a third PR.

## How to check

```bash
python3 -m unittest tests/check_integrity.py -v
```
