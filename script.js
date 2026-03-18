/* ═══════════════════════════════════════════
   RAJ AMRUTIYA PORTFOLIO — ADVANCED SCRIPT
═══════════════════════════════════════════ */

'use strict';

/* ─── SCROLL RESTORATION ─── */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const forceTop = () => {
  if (window.location.hash) history.replaceState(null, '', window.location.pathname);
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};
window.addEventListener('DOMContentLoaded', forceTop);
window.addEventListener('load', forceTop);
window.addEventListener('pageshow', () => setTimeout(forceTop, 0));

/* ─── DOM REFS ─── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

const navToggle   = $('#navToggle');
const navList     = $('#navList');
const contactForm = $('#contactForm');
const formMsg     = $('#formMsg');
const backToTop   = $('#backToTop');
const cursor      = $('#cursor');
const cursorDot   = $('#cursorDot');
const canvas      = $('#particleCanvas');
const header      = $('.header');

/* ════════════════════════════════════
   1. PARTICLE CANVAS
════════════════════════════════════ */
(function initParticles() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -9999, y: -9999 };
  const PARTICLE_COUNT = 90;
  const CONNECTION_DIST = 140;
  const MOUSE_REPEL = 120;

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };

  class Particle {
    constructor() { this.reset(true); }
    reset(random) {
      this.x  = random ? Math.random() * W : (Math.random() < 0.5 ? 0 : W);
      this.y  = random ? Math.random() * H : (Math.random() < 0.5 ? 0 : H);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.8 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.3;
      const hue = [200, 220, 260, 160][Math.floor(Math.random() * 4)];
      this.col = `hsla(${hue}, 90%, 70%,`;
    }
    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL) {
        const force = (MOUSE_REPEL - dist) / MOUSE_REPEL;
        this.vx += (dx / dist) * force * 0.5;
        this.vy += (dy / dist) * force * 0.5;
      }
      this.vx *= 0.99;
      this.vy *= 0.99;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + this.alpha + ')';
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  };

  const connect = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          const a = 1 - d / CONNECTION_DIST;
          ctx.strokeStyle = `rgba(56,189,248,${a * 0.18})`;
          ctx.lineWidth = a * 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', () => { resize(); particles.forEach(p => p.reset(true)); });
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  init();
  animate();
})();

/* ════════════════════════════════════
   2. CUSTOM CURSOR
════════════════════════════════════ */
(function initCursor() {
  if (!cursor || !cursorDot || window.matchMedia('(hover:none)').matches) return;
  let cx = 0, cy = 0, dx = 0, dy = 0;

  document.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    cursorDot.style.left = dx + 'px';
    cursorDot.style.top  = dy + 'px';
  });

  const lerp = (a, b, t) => a + (b - a) * t;
  const loop = () => {
    cx = lerp(cx, dx, 0.12);
    cy = lerp(cy, dy, 0.12);
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(loop);
  };
  loop();

  const hoverTargets = 'a, button, .btn, .project-card, .skill-card, .cert-card, input, textarea, .contact-link, .social-link';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) cursor.classList.add('hovered');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) cursor.classList.remove('hovered');
  });
})();

/* ════════════════════════════════════
   3. TYPING EFFECT
════════════════════════════════════ */
(function initTyping() {
  const el = $('#typingText');
  if (!el) return;
  const phrases = [
    'secure web apps.',
    'clean, fast UIs.',
    'Java backends.',
    'full-stack systems.',
    'crypto tools.',
  ];
  let i = 0, j = 0, deleting = false;

  const TYPE_SPEED   = 65;
  const DELETE_SPEED = 38;
  const PAUSE_END    = 1800;
  const PAUSE_START  = 350;

  const tick = () => {
    const phrase = phrases[i];
    if (deleting) {
      el.textContent = phrase.slice(0, --j);
      if (j === 0) {
        deleting = false;
        i = (i + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    } else {
      el.textContent = phrase.slice(0, ++j);
      if (j === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    }
  };
  setTimeout(tick, 900);
})();

/* ════════════════════════════════════
   4. NAVIGATION
════════════════════════════════════ */
(function initNav() {
  if (!navToggle || !navList) return;

  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  $$('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (navList.classList.contains('open') && !e.target.closest('.nav') ) {
      navList.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Active nav indicator
  const sections = $$('section[id]');
  const links    = $$('.nav-list a[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));
})();

/* ════════════════════════════════════
   5. SCROLL REVEAL (no-op — GSAP handles all reveal animations)
════════════════════════════════════ */
// CSS .reveal class is a marker only; animations are owned by GSAP below.

/* ════════════════════════════════════
   6. SKILL BARS
════════════════════════════════════ */
(function initSkillBars() {
  const bars = $$('.skill-bar');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pct = entry.target.getAttribute('data-pct') || '75';
        const fill = entry.target.querySelector('span');
        if (fill) fill.style.width = pct + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => observer.observe(b));
})();

/* ════════════════════════════════════
   7. COUNTER ANIMATION
════════════════════════════════════ */
(function initCounters() {
  const counters = $$('.stat-num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute('data-target');
        const duration = 1200;
        const start = performance.now();
        const tick = now => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          entry.target.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
          else entry.target.textContent = target;
        };
        requestAnimationFrame(tick);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });
  counters.forEach(c => observer.observe(c));
})();

/* ════════════════════════════════════
   8. 3D TILT ON CARDS
════════════════════════════════════ */
(function initTilt() {
  const cards = $$('.project-card, .hero-card-inner');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const mx   = rect.width  / 2;
      const my   = rect.height / 2;
      const rx   = -((y - my) / my) * 8;
      const ry   =  ((x - mx) / mx) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
})();

/* ════════════════════════════════════
   9. MAGNETIC BUTTONS
════════════════════════════════════ */
(function initMagnetic() {
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const dx     = e.clientX - (rect.left + rect.width  / 2);
      const dy     = e.clientY - (rect.top  + rect.height / 2);
      const dist   = Math.sqrt(dx * dx + dy * dy);
      const radius = 80;
      if (dist < radius) {
        const strength = (radius - dist) / radius;
        btn.style.transform = `translate(${dx * strength * 0.35}px, ${dy * strength * 0.3}px)`;
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ════════════════════════════════════
   10. GSAP ANIMATIONS
════════════════════════════════════ */
(function initGSAP() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // — Hero entrance —
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.header',        { y: -32, opacity: 0, duration: 0.6 })
    .from('.nav-list li',   { y: -14, opacity: 0, stagger: 0.06, duration: 0.4 }, '-=0.3')
    .from('.hero-eyebrow',  { y: 22, opacity: 0, duration: 0.55 }, '-=0.2')
    .from('.hero-title',    { y: 36, opacity: 0, duration: 0.65, skewY: 2 }, '-=0.35')
    .from('.hero-subtitle', { y: 22, opacity: 0, duration: 0.5 }, '-=0.45')
    .from('.hero-desc',     { y: 18, opacity: 0, duration: 0.5 }, '-=0.4')
    .from('.hero-actions .btn', { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, '-=0.35')
    .from('.hero-social .social-link', { y: 12, opacity: 0, stagger: 0.07, duration: 0.4 }, '-=0.3')
    .from('.hero-card-inner', { x: 40, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.65')
    .from('.float-tag', { scale: 0, opacity: 0, stagger: 0.12, duration: 0.45, ease: 'back.out(1.7)' }, '-=0.4');

  // — Section headings —
  $$('.section-heading').forEach(el => {
    gsap.from(el.children, {
      y: 28, opacity: 0, duration: 0.6, stagger: 0.14, ease: 'power3.out',
      clearProps: 'all',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // — Skills cards —
  $$('.skill-card').forEach((card, i) => {
    gsap.from(card, {
      y: 40, opacity: 0, duration: 0.6, ease: 'power3.out',
      delay: i * 0.08, clearProps: 'all',
      scrollTrigger: { trigger: card, start: 'top 90%', once: true },
    });
  });

  // — Project cards —
  $$('.project-card').forEach((card, i) => {
    gsap.from(card, {
      y: 44, opacity: 0, duration: 0.65, ease: 'power3.out',
      delay: i * 0.1, clearProps: 'all',
      scrollTrigger: { trigger: card, start: 'top 90%', once: true },
    });
  });

  // — Achievement cards —
  $$('.achieve-card').forEach((card, i) => {
    gsap.from(card, {
      y: 38, opacity: 0, duration: 0.6, ease: 'power3.out',
      delay: i * 0.1, clearProps: 'all',
      scrollTrigger: { trigger: card, start: 'top 92%', once: true },
    });
  });

  // — Cert cards —
  $$('.cert-card').forEach((card, i) => {
    gsap.from(card, {
      y: 38, opacity: 0, duration: 0.6, ease: 'power3.out',
      delay: i * 0.1, clearProps: 'all',
      scrollTrigger: { trigger: card, start: 'top 92%', once: true },
    });
  });

  // — Timeline item —
  gsap.from('.timeline-card', {
    x: -28, opacity: 0, duration: 0.65, ease: 'power3.out', clearProps: 'all',
    scrollTrigger: { trigger: '.timeline-card', start: 'top 88%', once: true },
  });

  // — Education items —
  $$('.edu-item').forEach((item, i) => {
    gsap.from(item, {
      y: 30, opacity: 0, duration: 0.55, delay: i * 0.15, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: '.edu-timeline', start: 'top 88%', once: true },
    });
  });

  // — Edu connectors —
  $$('.edu-connector').forEach(c => {
    gsap.from(c, {
      scaleX: 0, opacity: 0, duration: 0.5, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: { trigger: '.edu-timeline', start: 'top 88%', once: true },
    });
  });

  // — Parallax blobs —
  gsap.to('.blob-1', {
    yPercent: -22, xPercent: 12, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 },
  });
  gsap.to('.blob-2', {
    yPercent: 18, xPercent: -10, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.2 },
  });
  gsap.to('.blob-3', {
    yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });

  // — Horizontal glide on contact items —
  gsap.from('.contact-items .contact-item', {
    x: -24, opacity: 0, stagger: 0.09, duration: 0.55, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-info', start: 'top 82%' },
  });
  gsap.from('.contact-form', {
    x: 24, opacity: 0, duration: 0.65, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-form', start: 'top 84%' },
  });
})();

/* ════════════════════════════════════
   11. HERO CARD 3D (mouse parallax)
════════════════════════════════════ */
(function initHeroParallax() {
  const wrapper = $('#heroCard');
  if (!wrapper) return;
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 16;
    const my = (e.clientY / window.innerHeight - 0.5) * 16;
    wrapper.style.transform = `perspective(1200px) rotateY(${mx}deg) rotateX(${-my}deg)`;
  });
  document.addEventListener('mouseleave', () => {
    wrapper.style.transform = '';
  });
})();

/* ════════════════════════════════════
   12. CONTACT FORM
════════════════════════════════════ */
(function initForm() {
  if (!contactForm || !formMsg) return;

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name    = contactForm.name.value.trim();
    const email   = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    formMsg.className = 'form-msg';

    if (!name || !email || !message) {
      formMsg.textContent = '⚠ Please fill in all fields.';
      formMsg.classList.add('error');
      return;
    }
    if (!emailRe.test(email)) {
      formMsg.textContent = '⚠ Please enter a valid email address.';
      formMsg.classList.add('error');
      return;
    }

    formMsg.textContent = '✅ Thanks! Opening your email client…';

    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body    = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply-to: ${email}`);
    window.location.href = `mailto:rajamrutiya2006@gmail.com?subject=${subject}&body=${body}`;
    contactForm.reset();
  });
})();

/* ════════════════════════════════════
   13. BACK TO TOP
════════════════════════════════════ */
(function initBackToTop() {
  if (!backToTop) return;
  const toggle = () => backToTop.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ════════════════════════════════════
   14. NAV LINK ACTIVE STYLES (CSS)
════════════════════════════════════ */
// inject tiny dynamic style for active nav
const style = document.createElement('style');
style.textContent = `
  .nav-list a.active {
    color: var(--primary) !important;
    background: rgba(56,189,248,0.08);
  }
`;
document.head.appendChild(style);
