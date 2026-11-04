# SEED Lab — UCLA Semel Institute

Website for the **SEED Laboratory** (Signatures of Early Emergence and Divergence), led by Brittany Wolff, Ph.D., at the UCLA Jane & Terry Semel Institute for Neuroscience and Human Behavior.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home — animated "divergence field" hero, the acronym, the central question, six methods, PI, publications, news, get involved |
| `research.html` | Research question, model diagram, six modalities, current projects, funders |
| `team.html` | PI feature, filterable member grid with bio drawer, alumni |
| `publications.html` | Searchable, filterable list grouped by year |
| `news.html` | Featured story and news list |
| `join.html` | Participate / Join the lab tabs, FAQ, open positions, contact form |

## Checks

Run the static checks with Python 3.9+ and Node:

```sh
python3 tests/check_site.py
node --check assets/js/main.js
node --check assets/js/data.js
git diff --check
```

Browser checks require Python Playwright 1.55.0 and its Chromium browser:

```sh
python3 -m venv /tmp/seed-browser-tests
/tmp/seed-browser-tests/bin/pip install playwright==1.55.0
/tmp/seed-browser-tests/bin/playwright install chromium --with-deps
/tmp/seed-browser-tests/bin/python tests/browser_checks.py
```

The browser suite opens local files and blocks external font requests. It checks all six pages at desktop and mobile sizes, both motion preferences, theme controls, skip links, menu and drawer focus, tabs, publication search, and animation-library failure. It does not verify external links or replace a visual review with the production fonts.
