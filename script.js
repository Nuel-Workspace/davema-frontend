document.addEventListener('DOMContentLoaded', () => {

  // ---- Respect reduced motion preference ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scroll progress bar ----
  const progressBar = document.getElementById('scroll-progress');
  function updateScrollProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  // ---- Hero parallax (background drifts slower than scroll) ----
  const heroBg = document.querySelector('.hero-bg-wrap');
  function updateHeroParallax() {
    if (!heroBg || prefersReducedMotion) return;
    const scrollTop = window.scrollY;
    heroBg.style.transform = `translateY(${scrollTop * 0.15}px)`;
  }

  function onScroll() {
    updateScrollProgress();
    updateHeroParallax();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Reveal-on-scroll (fades/slides sections in as they enter view) ----
  if (!prefersReducedMotion) {
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    // ---- Staggered groups (service cards, process steps, work items, stats) ----
    const staggerGroups = [
      document.querySelector('.services-grid'),
      document.querySelector('.process-list'),
      document.querySelector('.work-list'),
      document.querySelector('.about-stats'),
    ];

    staggerGroups.forEach(group => {
      if (!group) return;
      const items = group.querySelectorAll('.stagger-item');
      const groupObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            items.forEach((item, i) => {
              setTimeout(() => item.classList.add('is-visible'), i * 100);
            });
            groupObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      groupObserver.observe(group);
    });
  } else {
    // If reduced motion is preferred, just show everything immediately
    document.querySelectorAll('.reveal, .stagger-item').forEach(el => el.classList.add('is-visible'));
  }

  // ---- Terminal typewriter effect (runs once on load) ----
  const terminalBody = document.getElementById('terminalBody');
  const typeCursor = document.getElementById('typeCursor');

  function typeLine(el, text, speed) {
    return new Promise(resolve => {
      let i = 0;
      (function step() {
        el.textContent = text.slice(0, i);
        i++;
        if (i <= text.length) {
          setTimeout(step, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  async function runTypewriter() {
    if (!terminalBody) return;
    const targets = terminalBody.querySelectorAll('.type-target');
    for (const target of targets) {
      const text = target.getAttribute('data-text') || '';
      await typeLine(target, text, 28);
      await new Promise(r => setTimeout(r, 220));
    }
    if (typeCursor) typeCursor.classList.add('is-active');
  }

  if (terminalBody) {
    if (prefersReducedMotion) {
      terminalBody.querySelectorAll('.type-target').forEach(t => {
        t.textContent = t.getAttribute('data-text') || '';
      });
      if (typeCursor) typeCursor.classList.add('is-active');
    } else {
      runTypewriter();
    }
  }

  // ---- Cursor-following glow (desktop, fine-pointer devices only) ----
  const cursorGlow = document.getElementById('cursor-glow');
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursorGlow && supportsHover && !prefersReducedMotion) {
    let glowX = window.innerWidth / 2;
    let glowY = window.innerHeight / 2;
    let targetX = glowX;
    let targetY = glowY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorGlow.classList.add('is-active');
    }, { passive: true });

    function animateGlow() {
      glowX += (targetX - glowX) * 0.15;
      glowY += (targetY - glowY) * 0.15;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  const overlay = document.getElementById('overlay');
  const menuToggle = document.getElementById('menuToggle');
  const overlayClose = document.getElementById('overlayClose');

  // Keep overlay content out of tab order while it's closed/invisible
  if (overlay && 'inert' in overlay) {
    overlay.inert = true;
  }

  if (menuToggle && overlay) {
    menuToggle.addEventListener('click', () => {
      overlay.classList.add('open');
      if ('inert' in overlay) overlay.inert = false;
      document.body.style.overflow = 'hidden';
      if (overlayClose) overlayClose.focus();
    });
  }

  if (overlayClose && overlay) {
    overlayClose.addEventListener('click', () => {
      overlay.classList.remove('open');
      if ('inert' in overlay) overlay.inert = true;
      document.body.style.overflow = '';
      if (menuToggle) menuToggle.focus();
    });
  }

  if (overlay) {
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
        if ('inert' in overlay) overlay.inert = true;
        document.body.style.overflow = '';
        if (menuToggle) menuToggle.focus();
      }
    });

    overlay.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        overlay.classList.remove('open');
        if ('inert' in overlay) overlay.inert = true;
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Contact form ----
  const BACKEND_URL = 'https://davema-backend-vercel.vercel.app/api/contact';

  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtnText = document.getElementById('submitBtnText');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const message = document.getElementById('form-msg').value.trim();
      const botcheck = document.getElementById('botcheck').checked;

      statusEl.textContent = '';
      statusEl.className = 'form-status';
      submitBtnText.textContent = '$ sending...';

      try {
        const res = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message, botcheck }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          statusEl.textContent = 'Message sent — we\'ll get back to you soon.';
          statusEl.classList.add('success');
          form.reset();
        } else {
          statusEl.textContent = data.message || 'Something went wrong. Please try again.';
          statusEl.classList.add('error');
        }
      } catch (err) {
        statusEl.textContent = 'Could not reach the server. Please try again later.';
        statusEl.classList.add('error');
      } finally {
        submitBtnText.textContent = '$ send_message';
      }
    });
  }
});