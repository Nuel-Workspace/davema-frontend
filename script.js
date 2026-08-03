document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const menuToggle = document.getElementById('menuToggle');
  const overlayClose = document.getElementById('overlayClose');

  if (menuToggle && overlay) {
    menuToggle.addEventListener('click', () => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (overlayClose && overlay) {
    overlayClose.addEventListener('click', () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (overlay) {
    overlay.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        overlay.classList.remove('open');
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