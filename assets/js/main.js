/* ==========================================================================
   SEED Lab — main.js
   Shared chrome (header/footer), motion system, divergence canvas,
   and renderers for team / publications / news (data in data.js).
   ========================================================================== */
(() => {
  'use strict';

  const D = window.SEED || {};
  const html = document.documentElement;
  const page = document.body.dataset.page || 'home';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) html.classList.add('reduce');
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!hasGSAP) html.classList.add('no-motion');
  // Tiny per-tab state that survives page navigation (no browser storage needed)
  const state = {
    read() { try { return JSON.parse(window.name || '{}') || {}; } catch (e) { return {}; } },
    set(k, v) { const o = this.read(); o[k] = v; try { window.name = JSON.stringify(o); } catch (e) {} },
    get(k) { return this.read()[k]; }
  };

  // Keep modal focus and pointer interaction within the active overlay.
  function modalFocus(root, controls = []) {
    let previous = null, background = [];
    const allowed = [root, ...controls];
    const focusable = () => allowed.flatMap(el =>
      [el, ...el.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
        .filter(node => node.tabIndex >= 0 && !node.disabled && !node.closest('[inert]') && node.getClientRects().length)
    );
    const trap = e => {
      if (e.key !== 'Tab') return;
      const nodes = focusable(), i = nodes.indexOf(document.activeElement);
      e.preventDefault();
      nodes[(i + (e.shiftKey ? -1 : 1) + nodes.length) % nodes.length]?.focus();
    };
    const isolate = parent => Array.from(parent.children).forEach(el => {
      if (allowed.includes(el)) return;
      if (allowed.some(node => el.contains(node))) isolate(el);
      else if (!el.inert) { el.inert = true; background.push(el); }
    });
    return {
      open() {
        previous = document.activeElement;
        root.inert = false;
        isolate(document.body);
        document.addEventListener('keydown', trap);
        focusable()[0]?.focus({ preventScroll: true });
      },
      close() {
        document.removeEventListener('keydown', trap);
        background.forEach(el => { el.inert = false; });
        background = [];
        previous?.focus({ preventScroll: true });
        root.inert = true;
      }
    };
  }

  /* ------------------------------------------------------------------------
     Icons + logo
     ------------------------------------------------------------------------ */
  const ARROW = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 6h10M6.5 1.5 11 6l-4.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ARROW_UR = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const PLUS = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const CLOSE = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const MOON = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const SUN = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3.6" stroke="currentColor" stroke-width="1.4"/><path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M16 4l-1.4 1.4M5.4 14.6 4 16M16 16l-1.4-1.4M5.4 5.4 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

  let uid = 0;
  /* The SEED mark: a seed split by a forked path.
     Left half = solid (resilience) · right half = trajectories (divergence)
     Top = emerging sprout (ember) · dot = the point of divergence. */
  function mark({ ink = 'currentColor', ember = '#E4572E', label = 'SEED Lab' } = {}) {
    const i = ++uid;
    const ls = [5.6, 11.2, 16.8, 22.4, 28, 33.6]
      .map(dx => `<path d="M${50 + dx} 110 L${50 + dx} 62 C${50 + dx} 50 ${58 + dx} 40 ${78 + dx} 26 L${98 + dx} 12"/>`).join('');
    return `<svg viewBox="8 -4 84 104" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="sc${i}"><path d="M50 3 C 79 26 88 63 50 97 C 12 63 21 26 50 3 Z"/></clipPath>
        <clipPath id="lc${i}"><path d="M50 110 L50 62 C50 50 42 40 22 26 L-10 4 L-10 110 Z"/></clipPath>
        <clipPath id="rc${i}"><path d="M50 110 L50 62 C50 50 58 40 78 26 L110 4 L110 110 Z"/></clipPath>
        <clipPath id="tc${i}"><path d="M50 62 C50 50 42 40 22 26 L-10 4 L-10 -20 L110 -20 L110 4 L78 26 C58 40 50 50 50 62 Z"/></clipPath>
        <mask id="fk${i}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
          <rect x="-20" y="-20" width="140" height="140" fill="#fff"/>
          <path d="M50 110 L50 62 C50 50 42 40 22 26 L-10 4 M50 62 C50 50 58 40 78 26 L110 4" fill="none" stroke="#000" stroke-width="5.6"/>
        </mask>
      </defs>
      <g mask="url(#fk${i})"><g clip-path="url(#sc${i})">
        <rect class="m-left" x="-10" y="-10" width="120" height="120" fill="${ink}" clip-path="url(#lc${i})"/>
        <g class="m-right" clip-path="url(#rc${i})" fill="none" stroke="${ink}" stroke-width="2.7">${ls}</g>
      </g></g>
      <g class="m-top" transform="translate(0 -4)" mask="url(#fk${i})"><g clip-path="url(#sc${i})"><rect x="-10" y="-20" width="120" height="120" fill="${ember}" clip-path="url(#tc${i})"/></g></g>
      <circle class="m-dot" cx="50" cy="62" r="3.6" fill="${ember}"/>
    </svg>`;
  }
  window.SEED.mark = mark;

  /* ------------------------------------------------------------------------
     Header / mobile menu / footer
     ------------------------------------------------------------------------ */
  const NAV = [
    { href: 'research.html', label: 'Research', key: 'research' },
    { href: 'team.html', label: 'Team', key: 'team' },
    { href: 'publications.html', label: 'Publications', key: 'publications' },
    { href: 'news.html', label: 'News', key: 'news' },
    { href: 'join.html', label: 'Join', key: 'join' }
  ];

  function renderChrome() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="nav-shell">
        <a class="brand" href="index.html" aria-label="SEED Lab home">
          <span class="brand-mark">${mark()}</span>
          <span class="brand-text"><span class="brand-name">SEED Lab</span><span class="brand-sub">UCLA · Semel Institute</span></span>
        </a>
        <nav class="nav-links" aria-label="Primary">
          ${NAV.map((n, i) => `<a href="${n.href}" ${page === n.key ? 'aria-current="page"' : ''}><sup>0${i + 1}</sup>${n.label}</a>`).join('')}
        </nav>
        <div class="nav-actions">
          <button class="icon-btn theme-btn" type="button" aria-label="Dark mode" aria-pressed="${html.dataset.theme === 'dark'}">${html.dataset.theme === 'dark' ? SUN : MOON}</button>
          <a class="btn btn-ink nav-cta" href="join.html#contact">Contact <span class="arr">${ARROW}</span></a>
          <button class="icon-btn menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu"><span class="bars"><span></span><span></span></span></button>
        </div>
      </div>`;
    document.body.prepend(header);

    const mm = document.createElement('div');
    mm.className = 'mobile-menu';
    mm.id = 'mobileMenu';
    mm.inert = true;
    mm.setAttribute('role', 'dialog');
    mm.setAttribute('aria-label', 'Navigation menu');
    mm.setAttribute('aria-hidden', 'true');
    mm.innerHTML = `
      <ol>
        <li><a href="index.html"><span>00</span>Home</a></li>
        ${NAV.map((n, i) => `<li><a href="${n.href}"><span>0${i + 1}</span>${n.label}</a></li>`).join('')}
      </ol>
      <div class="mm-foot"><div>760 Westwood Plaza<br>Los Angeles, CA 90095</div><a href="mailto:bwolff@mednet.ucla.edu">Email the lab</a></div>`;
    header.after(mm);

    const skip = document.createElement('a');
    skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
    document.body.prepend(skip);

    const curtain = document.createElement('div');
    curtain.className = 'curtain'; curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = mark({ ink: '#EDE7DA' });
    document.body.appendChild(curtain);

    const footer = document.querySelector('[data-footer]');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML = `
        <div class="wrap">
          <div class="foot-grid">
            <div class="foot-intro">
              <p>Seeing divergence early — so care can arrive <em class="ital accent">before</em> illness does.</p>
              <a class="btn btn-ember" href="join.html">Get involved <span class="arr">${ARROW}</span></a>
            </div>
            <div><h4>Visit</h4><ul><li>Semel Institute for Neuroscience &amp; Human Behavior</li><li>760 Westwood Plaza</li><li>Los Angeles, CA 90095</li></ul></div>
            <div><h4>Navigate</h4><ul>${NAV.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}</ul></div>
            <div><h4>Connect</h4><ul>
              <li><a href="mailto:bwolff@mednet.ucla.edu">bwolff@mednet.ucla.edu</a></li>
              <li><a href="https://www.semel.ucla.edu/initiatives/seedlab/" target="_blank" rel="noopener">Semel Institute page ↗</a></li>
              <li><a href="#" aria-label="Lab social profile (placeholder)">Social link (placeholder)</a></li>
            </ul>
            <h4 style="margin-top:1.75rem">Supported by</h4><ul><li>National Institute of Mental Health</li><li>Brain &amp; Behavior Research Foundation</li></ul></div>
          </div>
          <div class="foot-word" aria-hidden="true">
            <div class="big">${'SEED'.split('').map(c => `<span>${c}</span>`).join('')}</div>
            ${mark({ ink: '#EDE7DA' })}
          </div>
        </div>
        <div class="foot-bottom wrap mono">
          <span>© ${new Date().getFullYear()} SEED Laboratory · UCLA</span>
          <span>Signatures of Early Emergence and Divergence</span>
          <a href="#top" data-top>Back to top ↑</a>
        </div>`;
    }
  }

  /* ------------------------------------------------------------------------
     Theme toggle
     ------------------------------------------------------------------------ */
  function initTheme() {
    const btn = document.querySelector('.theme-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
      html.dataset.theme = next;
      state.set('theme', next);
      btn.innerHTML = next === 'dark' ? SUN : MOON;
      btn.setAttribute('aria-pressed', String(next === 'dark'));
      window.dispatchEvent(new Event('seed-theme'));
    });
  }

  /* ------------------------------------------------------------------------
     Header behaviour: scrolled state, hide on scroll down, dark detection
     ------------------------------------------------------------------------ */
  function initHeader(getScroll) {
    const header = document.querySelector('.site-header');
    const menuBtn = document.querySelector('.menu-btn');
    const mm = document.querySelector('.mobile-menu');
    const focus = modalFocus(mm, [menuBtn]);
    let last = 0;
    const darkSecs = () => document.querySelectorAll('[data-header="dark"]');

    const update = () => {
      const y = getScroll();
      header.classList.toggle('is-scrolled', y > 30);
      const goingDown = y > last && y > 400 && !header.contains(document.activeElement);
      if (!document.body.classList.contains('menu-open')) header.classList.toggle('is-hidden', goingDown);
      last = y;
      let onDark = false;
      darkSecs().forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= 44 && r.bottom >= 44) onDark = true; });
      header.classList.toggle('on-dark', onDark);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('seed-scroll', update);
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

    const toggle = (open) => {
      if (!open) focus.close();
      document.body.classList.toggle('menu-open', open);
      html.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mm.setAttribute('aria-hidden', String(!open));
      header.classList.remove('is-hidden');
      if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
      if (open) focus.open();
    };
    menuBtn.addEventListener('click', () => toggle(!document.body.classList.contains('menu-open')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) toggle(false); });
    window.matchMedia('(min-width: 1021px)').addEventListener('change', e => {
      if (e.matches && document.body.classList.contains('menu-open')) {
        toggle(false);
        header.querySelector('.brand').focus({ preventScroll: true });
      }
    });
  }

  /* ------------------------------------------------------------------------
     Page transitions (curtain)
     ------------------------------------------------------------------------ */
  function initTransitions() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if (a.hasAttribute('data-top')) { e.preventDefault(); window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' }); document.querySelector('.brand').focus({ preventScroll: true }); return; }
      if (!/\.html(#.*)?$/.test(href) || /^(https?:|mailto:|tel:)/.test(href)) return;
      const samePage = href.split('#')[0] === (location.pathname.split('/').pop() || 'index.html');
      if (samePage && href.includes('#')) return;
      if (reduce) return;
      e.preventDefault();
      state.set('nav', 1);
      html.classList.add('is-leaving');
      setTimeout(() => { window.location.href = href; }, 620);
    });
    window.addEventListener('pageshow', ev => { if (ev.persisted) html.classList.remove('is-leaving'); });
    if (html.classList.contains('is-entering')) setTimeout(() => html.classList.remove('is-entering'), 1100);
    state.set('nav', 0);
  }

  /* ------------------------------------------------------------------------
     Custom cursor
     ------------------------------------------------------------------------ */
  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || reduce) return;
    const c = document.createElement('div');
    c.className = 'cursor'; c.innerHTML = '<span>View</span>';
    document.body.appendChild(c);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; c.classList.add('is-on'); }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
    document.addEventListener('pointerover', e => {
      const v = e.target.closest('[data-cursor="view"]');
      const l = e.target.closest('a, button, summary, input, select, textarea, [role="button"]');
      c.classList.toggle('is-view', !!v);
      c.classList.toggle('is-link', !v && !!l);
      if (v) c.querySelector('span').textContent = v.dataset.cursorLabel || 'View';
    });
    const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`; requestAnimationFrame(loop); };
    loop();
  }

  /* ------------------------------------------------------------------------
     DIVERGENCE FIELD — the signature hero visual.
     Many trajectories start from one shared point (familial liability),
     travel together, then split: most toward resilience (sprout),
     some toward progression (ember). Mouse bends them; scroll widens them.
     ------------------------------------------------------------------------ */
  class Divergence {
    constructor(canvas, opts = {}) {
      this.c = canvas; this.ctx = canvas.getContext('2d');
      this.o = Object.assign({ theme: 'dark', count: 150, labels: null, interactive: true, compact: false }, opts);
      this.mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
      this.spread = 1; this.progress = reduce ? 1 : 0; this.t = 0; this.visible = true;
      this.seedLines();
      this.resize();
      addEventListener('resize', () => this.resize());
      if (this.o.interactive) {
        const host = this.c.parentElement;
        host.addEventListener('pointermove', e => { const r = this.c.getBoundingClientRect(); this.mouse.tx = e.clientX - r.left; this.mouse.ty = e.clientY - r.top; }, { passive: true });
        host.addEventListener('pointerleave', () => { this.mouse.tx = -9999; this.mouse.ty = -9999; });
      }
      this.loop = this.loop.bind(this);
      new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; if (this.visible) this.start(); }).observe(this.c);
      this.start();
    }
    start() { if (this.running) return; this.running = true; requestAnimationFrame(this.loop); }
    seedLines() {
      const n = this.o.count; this.lines = [];
      const rnd = (a, b) => a + Math.random() * (b - a);
      const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      for (let i = 0; i < n; i++) {
        const up = Math.random() < 0.62;
        let amp = Math.pow(Math.random(), 0.8) * 1.15 + 0.08;
        const neutral = amp < 0.32;
        this.lines.push({ dir: up ? -1 : 1, amp, neutral, off: gauss(), ph: rnd(0, Math.PI * 2), fq: rnd(0.6, 1.6), w: Math.random() < 0.12 ? 1.4 : 0.7, a: rnd(0.16, 0.5), delay: Math.random() * 0.25 });
      }
      this.parts = Array.from({ length: Math.round(n / 6) }, () => ({ li: Math.floor(Math.random() * n), u: Math.random(), sp: rnd(0.0007, 0.0022) }));
    }
    resize() {
      const r = this.c.getBoundingClientRect();
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      this.W = r.width; this.H = r.height;
      this.c.width = this.W * this.dpr; this.c.height = this.H * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      const mob = this.W < 760;
      if (this.o.compact) { this.ox = this.W * 0.06; this.oy = this.H * 0.5; this.sx = this.W * 0.32; this.upA = this.H * 0.36; this.dnA = this.H * 0.36; }
      else if (mob) { this.ox = this.W * 0.04; this.oy = this.H * 0.27; this.sx = this.W * 0.26; this.upA = this.H * 0.17; this.dnA = this.H * 0.3; }
      else { this.ox = this.W * 0.07; this.oy = this.H * 0.3; this.sx = this.W * 0.36; this.upA = this.H * 0.27; this.dnA = this.H * 0.42; }
      this.placeLabels();
    }
    y(l, x) {
      const W = this.W, u = Math.max(0, (x - this.ox) / (W - this.ox));
      const d = Math.max(0, Math.min(1, (x - this.sx) / (W * 1.02 - this.sx)));
      const e = Math.pow(d, 1.55);
      const wob = Math.sin(u * 7 * l.fq + l.ph + this.t * 0.45) * this.H * 0.012 * u;
      const amp = (l.dir < 0 ? this.upA : this.dnA) * l.amp * this.spread;
      let y = this.oy + l.off * this.H * 0.004 * (1 + u * 9) + wob + l.dir * amp * e;
      const m = this.mouse;
      if (m.x > -999) {
        const dx = x - m.x, dy = y - m.y, dist = Math.hypot(dx, dy), R = Math.min(220, this.W * 0.2);
        if (dist < R) { const f = Math.pow(1 - dist / R, 2); y += (dy >= 0 ? 1 : -1) * f * 46; }
      }
      return y;
    }
    color(l, a) {
      const dark = this.o.theme === 'dark' && html.dataset.theme !== 'force-light';
      const isDarkUI = this.o.theme === 'dark' || html.dataset.theme === 'dark';
      if (l.neutral) return isDarkUI ? `rgba(237,231,218,${a * 0.55})` : `rgba(15,28,22,${a * 0.5})`;
      if (l.dir > 0) return `rgba(228,87,46,${a * (isDarkUI ? 1 : 0.9)})`;
      return isDarkUI ? `rgba(183,201,138,${a})` : `rgba(15,28,22,${a * 0.75})`;
    }
    loop() {
      if (!this.visible) { this.running = false; return; }
      const ctx = this.ctx, W = this.W, H = this.H;
      if (!reduce) this.t += 0.016;
      this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.12; this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.12;
      if (this.mouse.tx < -999) { this.mouse.x = -9999; this.mouse.y = -9999; }
      ctx.clearRect(0, 0, W, H);
      const step = W < 760 ? 14 : 10;
      const endX = this.ox + (W * 1.04 - this.ox) * 1;
      for (const l of this.lines) {
        const p = Math.max(0, Math.min(1, (this.progress - l.delay) / (1 - l.delay)));
        if (p <= 0) continue;
        const xEnd = this.ox + (endX - this.ox) * p;
        ctx.beginPath();
        ctx.moveTo(this.ox, this.y(l, this.ox));
        for (let x = this.ox + step; x <= xEnd; x += step) ctx.lineTo(x, this.y(l, x));
        ctx.strokeStyle = this.color(l, l.a);
        ctx.lineWidth = l.w;
        ctx.stroke();
      }
      // travelling data points
      if (this.progress > 0.9) for (const pt of this.parts) {
        pt.u += reduce ? 0 : pt.sp; if (pt.u > 1) pt.u = 0;
        const l = this.lines[pt.li], x = this.ox + (endX - this.ox) * pt.u, y = this.y(l, x);
        ctx.beginPath(); ctx.arc(x, y, l.w > 1 ? 2.2 : 1.6, 0, Math.PI * 2);
        ctx.fillStyle = this.color(l, 0.95); ctx.fill();
      }
      // origin seed
      const pulse = (Math.sin(this.t * 2) + 1) / 2;
      ctx.beginPath(); ctx.arc(this.ox, this.oy, 14 + pulse * 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(228,87,46,${0.35 - pulse * 0.25})`; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(this.ox, this.oy, 4.5, 0, Math.PI * 2); ctx.fillStyle = '#E4572E'; ctx.fill();
      // split marker
      if (!this.o.compact && this.progress > 0.5) {
        ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(this.sx, this.oy - H * 0.08); ctx.lineTo(this.sx, this.oy + H * 0.08);
        ctx.strokeStyle = this.o.theme === 'dark' ? 'rgba(237,231,218,.3)' : 'rgba(15,28,22,.25)'; ctx.stroke(); ctx.setLineDash([]);
      }
      requestAnimationFrame(this.loop);
    }
    placeLabels() {
      const L = this.o.labels; if (!L) return;
      const set = (el, x, y) => { if (el) { el.style.left = x + 'px'; el.style.top = y + 'px'; } };
      set(L.origin, this.ox + 18, this.oy + 14);
      set(L.split, this.sx + 8, this.oy - this.H * 0.08 - 18);
      set(L.up, this.W - (L.up ? L.up.offsetWidth : 0) - Math.max(20, this.W * 0.03), Math.max(110, this.oy - this.upA * 0.95 - 10));
      set(L.down, this.W - (L.down ? L.down.offsetWidth : 0) - Math.max(20, this.W * 0.03), Math.min(this.H - 120, this.oy + this.dnA * 0.75));
    }
  }
  window.SEED.Divergence = Divergence;

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bold = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const fmtDate = iso => { const d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };

  function splitWords(el) {
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$('.w', el);
  }

  /* Placeholder portrait — generated per person, on-brand */
  const SWATCH = [
    ['#0F1C16', '#EDE7DA', '#E4572E'],
    ['#DCD3C1', '#0F1C16', '#E4572E'],
    ['#E4572E', '#0F1C16', '#F1ECE2'],
    ['#C9D4A6', '#0F1C16', '#E4572E'],
    ['#1D3328', '#EDE7DA', '#B7C98A'],
    ['#E7E0D1', '#1D3328', '#C4431D']
  ];
  function avatar(name, i) {
    const [bg, fg, ac] = SWATCH[i % SWATCH.length];
    const words = name.replace(/,.*$/, '').split(/\s+/);
    const ini = words.filter(w => /^[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const num = (name.match(/\d+/) || [''])[0];
    const curves = Array.from({ length: 9 }, (_, k) => {
      const y0 = 300 + (k - 4) * 3, dir = k < 5 ? -1 : 1, a = (Math.abs(k - 4) + 1) * 22;
      return `<path d="M-10 ${y0} C 120 ${y0} 170 ${y0} 240 ${y0 + dir * a * .3} S 360 ${y0 + dir * a} 420 ${y0 + dir * a * 1.2}" />`;
    }).join('');
    return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="500" fill="${bg}"/>
      <g fill="none" stroke="${fg}" stroke-opacity=".22" stroke-width="1.2" transform="rotate(${(i * 37) % 30 - 15} 200 250)">${curves}</g>
      <circle cx="70" cy="300" r="6" fill="${ac}"/>
      <text x="32" y="460" fill="${fg}" font-family="Boska, Georgia, serif" font-size="150" font-weight="500" letter-spacing="-6">${esc(ini)}${num ? `<tspan font-size="60" dx="10" fill="${ac}">${esc(num)}</tspan>` : ''}</text>
      <text x="32" y="56" fill="${fg}" fill-opacity=".6" font-family="JetBrains Mono, monospace" font-size="14" letter-spacing="1.5">PHOTO · REPLACE</text>
    </svg>`;
  }
  const portrait = (m, i) => m.photo ? `<img src="${esc(m.photo)}" alt="Portrait of ${esc(m.name)}" loading="lazy">` : avatar(m.name, i);

  /* ------------------------------------------------------------------------
     Renderers
     ------------------------------------------------------------------------ */
  function renderPubPreview() {
    const host = $('#pubPreview'); if (!host || !D.PUBLICATIONS) return;
    const list = D.PUBLICATIONS.filter(p => p.featured).slice(0, 4);
    host.innerHTML = list.map(p => `
      <a class="pub-row" href="publications.html" data-img="${esc(p.image || '')}">
        <span class="yr mono">${p.year} · ${esc(p.type)}</span>
        <span class="ttl">${esc(p.title)}</span>
        <span class="venue">${bold(p.authors)}<br><i>${esc(p.venue)}</i></span>
        <span class="go">${ARROW_UR}</span>
      </a>`).join('');
    // hover image follow
    const hi = document.createElement('div'); hi.className = 'hover-img'; hi.innerHTML = '<img alt="">';
    document.body.appendChild(hi);
    const img = hi.querySelector('img');
    let x = 0, y = 0, cx = 0, cy = 0, on = false;
    $$('.pub-row', host).forEach(r => {
      r.addEventListener('pointerenter', () => { if (r.dataset.img) { img.src = r.dataset.img; hi.classList.add('show'); on = true; } });
      r.addEventListener('pointerleave', () => { hi.classList.remove('show'); on = false; });
    });
    addEventListener('pointermove', e => { x = e.clientX + 170; y = e.clientY; }, { passive: true });
    const loop = () => { cx += (x - cx) * 0.14; cy += (y - cy) * 0.14; hi.style.left = cx + 'px'; hi.style.top = cy + 'px'; requestAnimationFrame(loop); };
    loop();
  }

  function renderNewsPreview() {
    const host = $('#newsPreview'); if (!host || !D.NEWS) return;
    host.innerHTML = D.NEWS.slice(0, 3).map(n => `
      <a class="news-card fade" href="news.html" data-cursor="view" data-cursor-label="Read">
        <div class="ni"><img src="${esc(n.image)}" alt="" loading="lazy"><span class="tag mono">${esc(n.category)}</span></div>
        <div class="meta mono"><span>${fmtDate(n.date)}</span></div>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.excerpt)}</p>
      </a>`).join('');
  }

  function renderNewsPage() {
    const f = $('#newsFeature'), l = $('#newsList'); if (!f || !D.NEWS) return;
    const [first, ...rest] = D.NEWS;
    f.innerHTML = `
      <a class="feature-news" href="${esc(first.href)}" data-cursor="view" data-cursor-label="Read">
        <div class="ni reveal-img"><img src="${esc(first.image)}" alt=""></div>
        <div>
          <span class="eyebrow">Latest · ${esc(first.category)}</span>
          <h2>${esc(first.title)}</h2>
          <p class="muted">${esc(first.excerpt)}</p>
          <p class="mono muted" style="margin-top:1.25rem">${fmtDate(first.date)}</p>
        </div>
      </a>`;
    l.innerHTML = rest.map(n => `
      <a class="news-li" href="${esc(n.href)}">
        <span class="d mono">${fmtDate(n.date)}</span>
        <span class="c mono">${esc(n.category)}</span>
        <span class="t">${esc(n.title)}</span>
        <span class="go">${ARROW_UR}</span>
      </a>`).join('');
  }

  function renderTeam() {
    const grid = $('#teamGrid'); if (!grid || !D.TEAM) return;
    const pi = D.TEAM.find(m => m.group === 'pi');
    const others = D.TEAM.filter(m => m.group !== 'pi');
    const piHost = $('#piFeature');
    if (pi && piHost) {
      piHost.innerHTML = `
        <div class="pi-wrap"><div class="arch reveal-img">${pi.photo ? `<img src="${esc(pi.photo)}" alt="Portrait of ${esc(pi.name)}">` : `<img src="assets/img/dandelion-dark.webp" alt=""><span class="placeholder-tag mono">PI portrait · replace</span>`}</div></div>
        <div>
          <span class="eyebrow">Principal Investigator</span>
          <h2 class="display pi-name">${esc(pi.name.replace(', Ph.D.', ''))}<span class="ital muted">, Ph.D.</span></h2>
          <div class="pi-roles"><span class="pill">Child &amp; Adolescent Psychiatry</span><span class="pill">Psychology</span><span class="pill">Semel Institute</span></div>
          <div class="prose"><p>${esc(pi.bio)}</p></div>
          <div class="pi-actions">
            <a class="btn btn-ink" href="mailto:${esc(pi.email)}">Email Dr. Wolff <span class="arr">${ARROW}</span></a>
            <a class="link-arrow" href="${esc(pi.links.cv || '#')}">Download CV ${ARROW_UR}</a>
            <a class="link-arrow" href="${esc(pi.links.scholar || '#')}">Google Scholar ${ARROW_UR}</a>
          </div>
        </div>`;
    }
    const GROUPS = { all: 'Everyone', postdoc: 'Postdoctoral', grad: 'Graduate', staff: 'Research staff', undergrad: 'Undergraduate' };
    const counts = others.reduce((a, m) => (a[m.group] = (a[m.group] || 0) + 1, a), {});
    $('#teamFilters').innerHTML = Object.entries(GROUPS).filter(([k]) => k === 'all' || counts[k])
      .map(([k, v]) => `<button class="chip" type="button" data-f="${k}" aria-pressed="${k === 'all'}">${v} <span class="c">${k === 'all' ? others.length : counts[k]}</span></button>`).join('');
    grid.innerHTML = others.map((m, i) => `
      <button class="member fade" type="button" data-g="${m.group}" data-i="${D.TEAM.indexOf(m)}" data-cursor="view" data-cursor-label="Bio">
        <div class="ph">${portrait(m, i)}<span class="more">${PLUS}</span></div>
        <div><div class="nm">${esc(m.name)}</div><div class="rl">${esc(m.role)}</div></div>
      </button>`).join('');
    $$('#teamFilters .chip').forEach(ch => ch.addEventListener('click', () => {
      $$('#teamFilters .chip').forEach(c => c.setAttribute('aria-pressed', String(c === ch)));
      const f = ch.dataset.f;
      $$('.member', grid).forEach(el => {
        const show = f === 'all' || el.dataset.g === f;
        el.classList.toggle('is-out', !show);
        if (show && hasGSAP && !reduce) gsap.fromTo(el, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .6, ease: 'expo.out' });
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
    const al = $('#alumni');
    if (al && D.ALUMNI) al.innerHTML = D.ALUMNI.map(a => `<li><span>${esc(a.name)}</span><span>${esc(a.next)}</span></li>`).join('');

    // Drawer
    const dr = $('#drawer'); if (!dr) return;
    const focus = modalFocus(dr);
    const open = (m, i) => {
      $('.drawer-media', dr).innerHTML = portrait(m, i);
      const dsvg = $('.drawer-media svg', dr); if (dsvg) dsvg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
      const L = m.links || {};
      $('.drawer-body', dr).innerHTML = `
        <span class="eyebrow">${esc(m.role)}</span>
        <h3 id="drawerTitle">${esc(m.name)}</h3>
        <p class="muted">${esc(m.bio)}</p>
        <dl><dt>Focus</dt><dd>${esc(m.focus)}</dd><dt>Education</dt><dd>${esc(m.education)}</dd>${m.email ? `<dt>Email</dt><dd><a class="link-arrow" href="mailto:${esc(m.email)}">${esc(m.email)}</a></dd>` : ''}</dl>
        <div class="drawer-links">${Object.entries(L).map(([k, v]) => `<a class="res-link" href="${esc(v)}">${esc(k[0].toUpperCase() + k.slice(1))} ${ARROW_UR}</a>`).join('')}</div>`;
      dr.classList.add('open'); dr.setAttribute('aria-hidden', 'false');
      html.classList.add('dialog-open');
      if (window.__lenis) window.__lenis.stop();
      focus.open();
    };
    const close = () => { focus.close(); dr.classList.remove('open'); dr.setAttribute('aria-hidden', 'true'); html.classList.remove('dialog-open'); if (window.__lenis) window.__lenis.start(); };
    grid.addEventListener('click', e => { const b = e.target.closest('.member'); if (!b) return; const idx = +b.dataset.i; open(D.TEAM[idx], others.indexOf(D.TEAM[idx])); });
    $('.drawer-close', dr).addEventListener('click', close);
    $('.drawer-scrim', dr).addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dr.classList.contains('open')) close(); });
  }

  function renderPublications() {
    const host = $('#pubList'); if (!host || !D.PUBLICATIONS) return;
    const P = D.PUBLICATIONS.slice().sort((a, b) => b.year - a.year);
    const types = ['All', ...Array.from(new Set(P.map(p => p.type)))];
    const typeCount = t => t === 'All' ? P.length : P.filter(p => p.type === t).length;
    $('#pubFilters').innerHTML = types.map(t => `<button type="button" class="chip" data-t="${esc(t)}" aria-pressed="${t === 'All'}">${esc(t)} <span class="c">${typeCount(t)}</span></button>`).join('');
    const totalEl = $('#pubTotal'); if (totalEl) totalEl.textContent = P.length;
    let type = 'All', q = '';
    const draw = () => {
      const ql = q.trim().toLowerCase();
      const items = P.filter(p => (type === 'All' || p.type === type) && (!ql || [p.title, p.authors, p.venue, p.year, ...(p.tags || [])].join(' ').toLowerCase().includes(ql)));
      const years = Array.from(new Set(items.map(p => p.year)));
      let n = items.length;
      host.innerHTML = years.map(y => {
        const ys = items.filter(p => p.year === y);
        return `<section class="pub-year"><div class="yl">${y}<small>${ys.length} ${ys.length === 1 ? 'paper' : 'papers'}</small></div><div>${ys.map(p => `
          <article class="pub-item">
            <span class="idx mono">${String(n--).padStart(2, '0')}</span>
            <div>
              <h3>${esc(p.title)}</h3>
              <p class="au">${bold(p.authors)}</p>
              <p class="ve">${esc(p.venue)}, ${p.year}</p>
              <div class="row">
                <span class="tag type">${esc(p.type)}</span>
                ${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
                <span style="flex:1"></span>
                ${p.pdf ? `<a class="res-link" href="${esc(p.pdf)}">PDF ${ARROW_UR}</a>` : ''}
                ${p.doi ? `<a class="res-link" href="${esc(p.doi)}">DOI ${ARROW_UR}</a>` : ''}
                ${p.code ? `<a class="res-link" href="${esc(p.code)}">Code ${ARROW_UR}</a>` : ''}
              </div>
            </div>
          </article>`).join('')}</div></section>`;
      }).join('');
      $('#pubEmpty').classList.toggle('show', items.length === 0);
      $('#pubCount').textContent = `Showing ${items.length} of ${P.length}`;
      if (hasGSAP && !reduce) gsap.fromTo($$('.pub-item', host), { opacity: 0 }, { opacity: 1, duration: .5, stagger: .03, ease: 'power2.out' });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    $$('#pubFilters .chip').forEach(ch => ch.addEventListener('click', () => { type = ch.dataset.t; $$('#pubFilters .chip').forEach(c => c.setAttribute('aria-pressed', String(c === ch))); draw(); }));
    let tmr; $('#pubSearch').addEventListener('input', e => { clearTimeout(tmr); tmr = setTimeout(() => { q = e.target.value; draw(); }, 120); });
    const clear = $('#pubClear'); if (clear) clear.addEventListener('click', () => { clearTimeout(tmr); q = ''; $('#pubSearch').value = ''; type = 'All'; $$('#pubFilters .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.t === 'All'))); draw(); $('#pubSearch').focus(); });
    draw();
  }

  function initTabs() {
    $$('[data-tabs]').forEach(t => {
      const btns = $$('button[role="tab"]', t), ind = $('.ind', t);
      const move = b => { ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft - 5}px)`; };
      const sel = b => {
        btns.forEach(x => { const on = x === b; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
        move(b); if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 50);
      };
      btns.forEach((b, i) => {
        b.addEventListener('click', () => sel(b));
        b.addEventListener('keydown', e => {
          let next;
          if (e.key === 'Home') next = btns[0];
          else if (e.key === 'End') next = btns[btns.length - 1];
          else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') next = btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length];
          if (next) { e.preventDefault(); next.focus(); sel(next); }
        });
      });
      const syncHash = () => {
        const initial = btns.find(b => b.dataset.hash === location.hash.slice(1));
        sel(initial || btns.find(b => b.getAttribute('aria-selected') === 'true') || btns[0]);
        if (initial) document.getElementById(initial.dataset.hash)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      };
      requestAnimationFrame(syncHash);
      addEventListener('hashchange', syncHash);
      addEventListener('resize', () => move(btns.find(b => b.getAttribute('aria-selected') === 'true')));
      document.fonts && document.fonts.ready.then(() => move(btns.find(b => b.getAttribute('aria-selected') === 'true')));
    });
  }

  function initForm() {
    const f = $('#contactForm'); if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!f.reportValidity()) return;
      const d = new FormData(f);
      const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nI am: ${d.get('topic')}\n\n${d.get('message')}`;
      const href = `mailto:bwolff@mednet.ucla.edu?subject=${encodeURIComponent('[SEED Lab website] ' + d.get('topic'))}&body=${encodeURIComponent(body)}`;
      $('#formOk').classList.add('show');
      window.location.href = href;
    });
  }

  /* ------------------------------------------------------------------------
     Motion system (GSAP + ScrollTrigger + Lenis)
     ------------------------------------------------------------------------ */
  function initMotion() {
    let getScroll = () => window.scrollY;
    if (!hasGSAP) { initHeader(getScroll); return; }
    gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis && !reduce) {
      const lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 1, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', () => { ScrollTrigger.update(); window.dispatchEvent(new Event('seed-scroll')); });
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      getScroll = () => lenis.scroll;
    }
    initHeader(getScroll);
    if (reduce) return;

    // Split-line headlines
    $$('[data-lines]').forEach(h => {
      const lines = $$('.line > span', h);
      gsap.set(lines, { yPercent: 115 });
      h.__intro = () => gsap.to(lines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.09 });
    });

    // Generic fades
    ScrollTrigger.batch('.fade', {
      start: 'top 88%',
      onEnter: els => gsap.to(els, { opacity: 1, duration: 1, ease: 'power2.out', stagger: 0.07, overwrite: true })
    });
    // Image clip reveals
    $$('.reveal-img').forEach(el => {
      gsap.to(el, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    // Parallax images
    $$('[data-parallax]').forEach(el => {
      gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // Counters
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count, o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'expo.out', onUpdate: () => { el.firstChild.nodeValue = Math.round(o.v); } }) });
    });

    // Acronym rows
    $$('.acro-row').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%', end: 'top 40%', scrub: 0.6 } });
      tl.fromTo($('.rest', row), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none' })
        .fromTo($('.conj', row), { opacity: 0 }, { opacity: 1, ease: 'none' }, '>-0.2')
        .fromTo($('.acro-note', row), { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.1);
    });

    // Statement word-by-word
    $$('[data-words]').forEach(el => {
      const ws = splitWords(el);
      gsap.fromTo(ws, { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: 0.5 } });
    });

    // Horizontal lenses
    const lens = $('.lenses');
    if (lens) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 861px)', () => {
        const track = $('.lenses-track', lens), bar = $('.lens-progress span', lens);
        const dist = () => track.scrollWidth - innerWidth;
        const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: lens, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
        gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: lens, start: 'top top', end: () => '+=' + dist(), scrub: true } });
        $$('.lens-img img', lens).forEach(img => gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.lens'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
        return () => {};
      });
    }

    // Full-bleed zoom
    $$('.bleed').forEach(b => {
      gsap.fromTo($('.bleed-media img', b), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
      const lines = $$('.bleed-quote .line > span', b);
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: b, start: 'top 45%' } });
    });

    // CTA title
    $$('.cta-title').forEach(t => {
      const lines = $$('.line > span', t);
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: t, start: 'top 80%' } });
    });

    // Footer letters
    const big = $('.foot-word .big');
    if (big) gsap.from($$('span', big), { yPercent: 100, duration: 1.4, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: big, start: 'top 95%' } });

    // Research TOC active state
    $$('.toc a').forEach(a => {
      const t = $(a.getAttribute('href')); if (!t) return;
      ScrollTrigger.create({ trigger: t, start: 'top 50%', end: 'bottom 50%', onToggle: s => s.isActive && ($$('.toc a').forEach(x => x.classList.toggle('active', x === a))) });
    });

    // Diagram draw
    $$('.diagram [data-draw]').forEach(p => {
      const len = p.getTotalLength ? p.getTotalLength() : 600;
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: p.closest('.diagram'), start: 'top 75%' } });
    });
    $$('.diagram [data-pop]').forEach((p, i) => gsap.from(p, { opacity: 0, duration: .8, delay: .6 + i * .12, scrollTrigger: { trigger: p.closest('.diagram'), start: 'top 75%' } }));

    window.addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  /* ------------------------------------------------------------------------
     Preloader + intros
     ------------------------------------------------------------------------ */
  function startIntro() {
    $$('[data-lines]').forEach(h => h.__intro && h.__intro());
    if (hasGSAP && !reduce) {
      gsap.from('.hero-bottom > *, .hero-meta > *, .ph-foot > *', { opacity: 0, duration: 1.2, ease: 'power2.out', stagger: .06, delay: .35 });
    }
    if (window.__hero) {
      const h = window.__hero;
      if (hasGSAP && !reduce) gsap.to(h, { progress: 1, duration: 3.2, ease: 'power3.inOut', onUpdate: () => { if (h.progress > .55) $$('.canvas-label').forEach(l => l.classList.add('show')); } });
      else { h.progress = 1; $$('.canvas-label').forEach(l => l.classList.add('show')); }
    }
    $$('[data-page-canvas]').forEach(c => { const d = c.__div; if (!d) return; if (hasGSAP && !reduce) gsap.to(d, { progress: 1, duration: 2.6, ease: 'power3.inOut', delay: .2 }); else d.progress = 1; });
  }

  function runLoader() {
    const L = $('.loader');
    if (!L || html.classList.contains('no-loader') || !hasGSAP || reduce) { if (L) L.remove(); startIntro(); return; }
    const cnt = $('.count', L), o = { v: 0 };
    const svg = $('svg', L);
    const tl = gsap.timeline();
    tl.from($$('.m-left, .m-right path', svg), { opacity: 0, duration: .5, stagger: .05, ease: 'power2.out' })
      .from($('.m-top', svg), { y: 14, opacity: 0, duration: .7, ease: 'expo.out' }, '-=.2')
      .from($('.m-dot', svg), { scale: 0, transformOrigin: '50% 50%', duration: .5, ease: 'back.out(3)' }, '-=.4')
      .to(o, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { cnt.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0)
      .from($('.ltxt span', L), { yPercent: 110, duration: .8, ease: 'expo.out' }, .2)
      .to(L, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut', onStart: () => setTimeout(startIntro, 250), onComplete: () => L.remove() }, '+=.15');
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  renderChrome();
  initTheme();
  renderPubPreview();
  renderNewsPreview();
  renderNewsPage();
  renderTeam();
  renderPublications();
  initTabs();
  initForm();

  // Hero canvas
  const hc = $('#heroCanvas');
  if (hc) {
    const mob = innerWidth < 760;
    window.__hero = new Divergence(hc, {
      theme: 'dark', count: mob ? 90 : 170,
      labels: { origin: $('#lblOrigin'), split: $('#lblSplit'), up: $('#lblUp'), down: $('#lblDown') }
    });
    if (hasGSAP && !reduce) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { window.__hero.spread = 1 + s.progress * 0.6; } });
    }
  }
  $$('[data-page-canvas]').forEach(c => { c.__div = new Divergence(c, { theme: 'light', count: innerWidth < 760 ? 60 : 110, compact: true, interactive: true }); });

  initMotion();
  initTransitions();
  initCursor();

  const go = () => runLoader();
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(go); else go();
})();
