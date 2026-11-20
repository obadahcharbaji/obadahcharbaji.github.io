(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // mobile menu
  const btn = $('.menu-toggle'), nav = $('.site-nav');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // brand returns to the very top
  $('.brand').addEventListener('click', e => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });

  // reading progress
  const bar = $('.progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // highlight the current section in the nav
  const links = new Map($$('.site-nav a[href^="#"]').map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const link = links.get(en.target.id);
        if (link && en.isIntersecting) {
          links.forEach(l => l.classList.remove('is-active'));
          if (!link.classList.contains('nav-cta')) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // only one video plays at a time
  const videos = $$('video');
  videos.forEach(v => v.addEventListener('play', () => videos.forEach(o => { if (o !== v) o.pause(); })));

  // copy email
  const toast = $('.toast');
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(b.dataset.copy); ok = true; } catch (_) {}
    toast.textContent = ok ? 'Email address copied' : 'Copy failed. Email: ' + b.dataset.copy;
    toast.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }));


  // hero signal: starts wild, damps out, and flatlines at the right edge. Plays once.
  const cv = $('#wave');
  if (cv && cv.getContext) {
    const ctx = cv.getContext('2d');
    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const DURATION = 8500;
    let w = 0, h = 0, pts = [], start = 0, raf = 0, finished = false;

    const build = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const mid = h / 2, pad = 14, usable = w - pad * 2, n = Math.ceil(usable / 2);
      const wl = w < 600 ? 110 : 150, k = (Math.PI * 2) / wl;            // one steady frequency
      pts = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n, x = pad + u * usable;
        const fade = 1 - Math.pow(Math.max((u - 0.62) / 0.38, 0), 2) * 0;   // (kept simple: exponential decay below)
        const env = Math.exp(-4.4 * u) * (u > 0.7 ? 1 - (u - 0.7) / 0.3 : 1) * fade;  // high, then low, then flat
        pts.push([x, mid - Math.sin(k * (x - pad)) * env * h * 0.42]);
      }
    };

    const frame = (p) => {
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.5; ctx.strokeStyle = css('--blue-deep'); ctx.globalAlpha = .5; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      const last = Math.max(1, Math.floor(p * (pts.length - 1)));
      ctx.strokeStyle = css('--ink'); ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= last; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
      const tip = pts[last];
      ctx.fillStyle = css('--red'); ctx.beginPath(); ctx.arc(tip[0], tip[1], 10, 0, Math.PI * 2); ctx.fill();
    };

    const tick = now => {
      if (!start) start = now;
      const t = Math.min((now - start) / DURATION, 1);
      frame(0.5 - Math.cos(Math.PI * t) / 2);   // eases in and out
      if (t < 1) raf = requestAnimationFrame(tick); else finished = true;
    };

    build();
    if (reduce) { frame(1); finished = true; } else raf = requestAnimationFrame(tick);
    addEventListener('resize', () => { build(); if (finished) frame(1); });
  }

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
