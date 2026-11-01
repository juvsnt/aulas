// Apenas realça a unidade em leitura. Os materiais e a navegação funcionam sem JavaScript.
const sections = [...document.querySelectorAll('.unit')];
const links = [...document.querySelectorAll('[data-unit]')];

if ('IntersectionObserver' in window) {
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    const current = sections.find((section) => visible.has(section));
    if (!current) return;
    for (const link of links) {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}
