/* ═══════════════════════════════════════════════════════════
   script.js — Vanilla JS for Ello's Portfolio
   ═══════════════════════════════════════════════════════════
   1. Typing animation (hero)
   2. Scroll-triggered reveals (Intersection Observer)
   3. Gallery lightbox (open / close / navigate / keyboard)
   4. Mobile navigation toggle
   5. Active nav-link on scroll
   6. Contact form validation
   7. Back-to-top button
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ─── 1. TYPING ANIMATION ─────────────────
     Cycles through phrases, typing then deleting
     one character at a time.
  ──────────────────────────────────────────── */
  const typedEl = document.getElementById('typed-text');
  const phrases = ['Teknik Informatika.', 'Pemrograman Web.', 'Personal Homepage.', 'Website Portofolio'];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const word = phrases[pi];
    typedEl.textContent = word.substring(0, deleting ? --ci : ++ci);

    if (!deleting && ci === word.length) {
      deleting = true;
      return setTimeout(type, 1800);
    }
    if (deleting && ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      return setTimeout(type, 400);
    }
    setTimeout(type, deleting ? 40 : 80);
  }
  type();

  /* ─── 3. SCROLL REVEAL ────────────────────
     IntersectionObserver adds '.visible' class
     to '.reveal' elements when they enter view.
     Each element animates only once (unobserved
     after becoming visible).
  ──────────────────────────────────────────── */
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ─── 3. GALLERY ALBUM FILTER ──────────────
     Clicking a filter button shows only images
     matching that album. 'All' shows everything.
     Uses requestAnimationFrame for smooth
     batch DOM updates.
  ──────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const allGalleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      // Batch DOM class changes inside a single animation frame
      requestAnimationFrame(() => {
        allGalleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.album === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  });

  /* ─── 4. GALLERY LIGHTBOX ─────────────────
     Click a gallery image → opens fullscreen
     modal. The lightbox only navigates through
     currently VISIBLE images (respects the
     active album filter).
     Supports:
     • Prev / Next navigation via arrows
     • Keyboard (Escape, ←, →)
     • Click backdrop to close
  ──────────────────────────────────────────── */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  let visibleSrcs = [];   // sources of currently visible images
  let visibleItems = [];   // DOM references of currently visible items
  let idx = 0;

  /** Build array of visible image sources for lightbox navigation */
  function buildVisibleSources() {
    visibleItems = Array.from(allGalleryItems).filter(
      item => !item.classList.contains('hidden')
    );
    visibleSrcs = visibleItems.map(item => item.querySelector('img').src);
  }

  function openLB(clickedItem) {
    buildVisibleSources();
    idx = visibleItems.indexOf(clickedItem);
    if (idx === -1) idx = 0;
    lbImg.src = visibleSrcs[idx];
    lb.classList.add('active');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLB() {
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function nextImg() {
    if (visibleSrcs.length === 0) return;
    idx = (idx + 1) % visibleSrcs.length;
    lbImg.src = visibleSrcs[idx];
  }
  function prevImg() {
    if (visibleSrcs.length === 0) return;
    idx = (idx - 1 + visibleSrcs.length) % visibleSrcs.length;
    lbImg.src = visibleSrcs[idx];
  }

  // Click handler on each gallery item
  allGalleryItems.forEach(item => {
    item.addEventListener('click', () => openLB(item));
  });

  document.getElementById('lightbox-close').addEventListener('click', closeLB);
  document.getElementById('lightbox-prev').addEventListener('click', e => { e.stopPropagation(); prevImg(); });
  document.getElementById('lightbox-next').addEventListener('click', e => { e.stopPropagation(); nextImg(); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowRight') nextImg();
    if (e.key === 'ArrowLeft') prevImg();
  });

  /* ─── 5. MOBILE NAV TOGGLE ───────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('.nav-link').forEach(l =>
    l.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    })
  );

  /* ─── 6. ACTIVE NAV LINK ON SCROLL ────────
     IntersectionObserver highlights the nav link
     matching the currently visible section.
  ──────────────────────────────────────────── */
  const sections = document.querySelectorAll('.section');
  const allNav = document.querySelectorAll('.nav-link');

  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        allNav.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => secObs.observe(s));

  /* ─── 7. CONTACT FORM VALIDATION ──────────
     Basic front-end validation with feedback.
     No backend — simulates success.
  ──────────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  const fb = document.getElementById('form-feedback');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const msg = form.elements.message.value.trim();

    if (!name || !email || !msg) return showFB('Please fill in all fields.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showFB('Please enter a valid email.', 'error');

    showFB('Message sent! Thank you, ' + name + '.', 'success');
    form.reset();
  });

  function showFB(msg, type) {
    fb.textContent = msg;
    fb.className = 'form-feedback ' + type;
    setTimeout(() => { fb.textContent = ''; fb.className = 'form-feedback'; }, 5000);
  }

  /* ─── 8. BACK TO TOP ──────────────────────── */
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
