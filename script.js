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

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
