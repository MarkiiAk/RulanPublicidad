/* RULÁN — OnePage Creativa/Portafolio (JS) */
(function () {
  const $win = $(window);
  const $doc = $(document);

  // ===== Util
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  // ===== Año en footer
  const yEl = document.getElementById('y');
  if (yEl) yEl.textContent = new Date().getFullYear();

  // ===== Burger + menú overlay
  const $burger = $('.burger');
  const $overlay = $('.menu-overlay');

  function closeMenu() {
    $('body').removeClass('menu-open');
    $burger.attr('aria-expanded', false);
  }
  function toggleMenu() {
    const open = $('body').toggleClass('menu-open').hasClass('menu-open');
    $burger.attr('aria-expanded', open);
  }

  $burger.on('click', toggleMenu);

  // Cierra al navegar dentro del overlay
  $overlay.on('click', 'a', closeMenu);

  // Cierra si clic fuera de los links
  $overlay.on('click', function (e) {
    if (e.target === this) closeMenu();
  });

  // Cierra con ESC
  $doc.on('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // ===== Scroll suave para anclas
  $doc.on('click', 'a[href^="#"]', function (e) {
    const id = $(this).attr('href');
    if (!id || id.length <= 1) return;
    const $el = $(id);
    if ($el.length) {
      e.preventDefault();
      const off = 64; // alto de header
      $('html, body').animate({ scrollTop: $el.offset().top - off }, 500);
      closeMenu();
    }
  });

// ===== Barra de progreso
const $progress = $('.progress span');
const setProgress = () => {
  const h = document.documentElement;
  const scrollY = window.pageYOffset != null ? window.pageYOffset : h.scrollTop;
  const max = Math.max(1, h.scrollHeight - h.clientHeight);
  const p = clamp((scrollY / max) * 100, 0, 100);
  $progress.css('width', p + '%');
};
setProgress();
$win.on('scroll resize', setProgress);


  // ===== Back to Top
  const $back = $('#backToTop');
  const backToggle = () => {
    if (!$back.length) return;
    const show = window.scrollY > 200;
    $back.toggleClass('is-visible', show);
  };
  backToggle();
  $win.on('scroll', backToggle);
  $back.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });

  // ===== Reveal on scroll (accesible)
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (!prefersReduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-inview'));
  }

  // ===== Carril horizontal (cases)
  const $rail = $('.rail');
  const $prev = $('.rail-prev');
  const $next = $('.rail-next');

function railStep() {
  if (!$rail.length) return 300;
  const first = $rail.children().get(0);
  if (!first) return 300;
  const r = first.getBoundingClientRect();
  // usa el gap real del grid si existiera
  const styles = window.getComputedStyle($rail.get(0));
  const gap = parseFloat(styles.columnGap || styles.gap || 14) || 14;
  return r.width + gap;
}


  $prev.on('click', function () {
    if ($rail.length) $rail.get(0).scrollBy({ left: -railStep(), behavior: 'smooth' });
  });
  $next.on('click', function () {
    if ($rail.length) $rail.get(0).scrollBy({ left: railStep(), behavior: 'smooth' });
  });

  // Teclas ← → cuando el carril tiene foco
  $rail.on('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); this.scrollBy({ left: -railStep(), behavior: 'smooth' }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); this.scrollBy({ left: railStep(), behavior: 'smooth' }); }
  });

  // ===== Parallax sutil del póster/orb (opcional, no invasivo)
  const orb = document.querySelector('.orb');
  if (orb && !prefersReduce) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    const lerp = (a, b, t) => a + (b - a) * t;
    window.addEventListener('mousemove', (e) => {
      const rect = orb.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 6;  // grados
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    });
    function loop() {
      cx = lerp(cx, tx, 0.08);
      cy = lerp(cy, ty, 0.08);
      orb.style.transform = `perspective(800px) rotateX(${cy}deg) rotateY(${cx}deg)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  // ===== Theme Toggle (sol/luna) — light/dark con localStorage
  const $themeBtn = $('#themeToggle');
  const STORAGE_KEY = 'rulan-theme'; // 'light' | 'dark'

  function applyTheme(theme) {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme === 'light' ? 'light-theme' : 'dark-theme');
    // aria-pressed e iconos (CSS se encarga de mostrar el correcto)
    const isLight = theme === 'light';
    $themeBtn.attr('aria-pressed', isLight);
    // guarda
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }

  function getInitialTheme() {
    // 1) Si hay preferencia guardada, úsala
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}

    // 2) Si el body ya trae clase (de tu HTML), respétala
    const body = document.body;
    if (body.classList.contains('light-theme')) return 'light';
    if (body.classList.contains('dark-theme')) return 'dark';

    // 3) Default según prefers-color-scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  if ($themeBtn.length) {
    // Setup inicial
    applyTheme(getInitialTheme());

    // Toggle al click
    $themeBtn.on('click', function () {
      const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }

})();
