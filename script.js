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


  // signal wave with a red ball riding it
  const cv = $('#wave');
  if (cv && cv.getContext) {
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, raf = 0, visible = true, t0 = performance.now();
    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const size = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const draw = now => {
      const t = reduce ? 1.2 : (now - t0) / 1000;
      const grow = reduce ? 1 : 1 - Math.pow(1 - Math.min(t / 1.4, 1), 4);   // wave eases in once
      const mid = h / 2, amp = h * 0.3 * grow;
      const wl = w < 600 ? 230 : 380, k = (Math.PI * 2) / wl, speed = 1.6;  // rad/s
      const f = (x, a, ph, kk) => mid + a * Math.sin(kk * x + ph + speed * t);
      ctx.clearRect(0, 0, w, h);
      // centre line
      ctx.strokeStyle = css('--line'); ctx.lineWidth = 1.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
      // faint second wave
      ctx.strokeStyle = css('--blue'); ctx.globalAlpha = .45; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) { const y = f(x, amp * .6, 1.7, k * 1.6); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.globalAlpha = 1;
      // main wave
      ctx.strokeStyle = css('--ink'); ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) { const y = f(x, amp, 0, k); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      // ball rides the main wave; dashed drop line to the centre line
      const bx = Math.min(w * 0.3, 360), by = f(bx, amp, 0, k);
      ctx.strokeStyle = css('--blue-deep'); ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(bx, mid); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = css('--red'); ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2); ctx.fill();
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };
    size(); draw(performance.now());
    addEventListener('resize', () => { size(); if (reduce) draw(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
      }).observe(cv);
    }
  }

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
