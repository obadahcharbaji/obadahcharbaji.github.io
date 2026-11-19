const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const opened = siteNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(opened));
    menuButton.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
  });
  siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }));
}
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  reveals.forEach(element => observer.observe(element));
} else {
  reveals.forEach(element => element.classList.add('is-visible'));
}

// Both the OC. mark and ELECTRICAL ENGINEERING label share the header link.
// Always scroll to the absolute top when either part is clicked.
const homeBrand = document.querySelector('.site-header .brand');
if (homeBrand) {
  homeBrand.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
  });
}
