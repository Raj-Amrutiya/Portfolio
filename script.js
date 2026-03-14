const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-list a');
const contactForm = document.querySelector('#contactForm');
const formMsg = document.querySelector('#formMsg');
const backToTop = document.querySelector('#backToTop');

// Prevent browsers from restoring previous scroll position on refresh/back.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const forceStartAtTop = () => {
  // If the URL has an anchor like #projects, browsers jump there on reload.
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

window.addEventListener('DOMContentLoaded', forceStartAtTop);
window.addEventListener('load', forceStartAtTop);
window.addEventListener('pageshow', () => {
  // pageshow also handles back-forward cache restores.
  setTimeout(forceStartAtTop, 0);
});

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      formMsg.textContent = 'Please fill in all fields.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formMsg.textContent = 'Please enter a valid email address.';
      return;
    }

    formMsg.textContent = 'Thanks! Your message is ready to send.';

    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:rajamrutiya2006@gmail.com?subject=${subject}&body=${body}`;

    contactForm.reset();
  });
}

if (window.AOS) {
  document.documentElement.classList.add('aos-active');
  AOS.init({
    duration: 750,
    once: true,
    easing: 'ease-out-cubic',
    offset: 60,
  });
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  introTl
    .from('.header', { y: -24, opacity: 0, duration: 0.55 })
    .from('.nav-list li', { y: -12, opacity: 0, stagger: 0.07, duration: 0.4 }, '-=0.25')
    .from('.hero-content > *', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
    }, '-=0.2')
    .from('.hero-card', {
      x: 30,
      y: 10,
      opacity: 0,
      duration: 0.65,
      clearProps: 'transform,opacity',
    }, '-=0.55');

  gsap.utils.toArray('.section-heading').forEach((heading) => {
    gsap.from(heading.children, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: heading,
        start: 'top 86%',
      },
    });
  });

  gsap.utils.toArray('.project-card, .skill-card, .timeline-card, .card:not(.no-motion)').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 84%',
      },
    });
  });

  gsap.utils.toArray('.project-card img').forEach((img) => {
    gsap.from(img, {
      scale: 1.08,
      opacity: 0.75,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: img,
        start: 'top 88%',
      },
    });
  });

  gsap.to('.bg-blur-1', {
    yPercent: -18,
    xPercent: 10,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
    },
  });

  gsap.to('.bg-blur-2', {
    yPercent: 15,
    xPercent: -8,
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.9,
    },
  });
}

const tiltTargets = document.querySelectorAll('.project-card');
tiltTargets.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateY = ((x - midX) / midX) * 3;
    const rotateX = -((y - midY) / midY) * 3;

    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  });
});

if (backToTop) {
  const toggleBackToTop = () => {
    if (window.scrollY > 320) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
