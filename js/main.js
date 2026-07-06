// Menu mobile
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-active');
  });
  navLinks.querySelectorAll(':scope > li:not(.has-dropdown) > a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-active');
    });
  });
  navLinks.querySelectorAll('.dropdown a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-active');
    });
  });
}

// Sous-menu "À propos" : clic pour ouvrir/fermer sur mobile, survol sur desktop (CSS)
document.querySelectorAll('.has-dropdown > a').forEach((toggle) => {
  toggle.addEventListener('click', (e) => {
    if (window.innerWidth <= 980) {
      e.preventDefault();
      toggle.parentElement.classList.toggle('is-open-sub');
    }
  });
});

// Photos d'équipe et logos partenaires : si le fichier attendu n'a pas
// encore été fourni, l'image 404 et on affiche le repli (initiales ou
// nom en texte) déjà présent dans le HTML. Le navigateur peut déclencher
// l'événement "error" avant que ce script ne s'exécute (image en tout
// début de <body>) : on vérifie donc aussi l'état déjà résolu de l'image.
document.querySelectorAll('img[data-fallback]').forEach((img) => {
  const hide = () => {
    if (img.dataset.fallback === 'collapse') {
      img.parentElement.style.display = 'none';
      return;
    }
    img.style.display = 'none';
    const fallback = img.nextElementSibling;
    if (fallback) fallback.classList.add('is-visible');
  };
  if (img.complete && img.naturalWidth === 0) hide();
  else img.addEventListener('error', hide, { once: true });
});

// Année du footer
document.querySelectorAll('#year').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Formulaires : envoi réel via FormSubmit (aucun backend nécessaire).
// FormSubmit demande une confirmation par e-mail lors du tout premier envoi
// vers une adresse donnée : ouvrez cet e-mail et cliquez sur "Activer" pour
// que les envois suivants soient livrés automatiquement dans la boîte mail.
// Pour changer l'adresse de réception, modifiez FORM_TARGET_EMAIL ci-dessous.
const FORM_TARGET_EMAIL = 'contact@beites-i.com';

function wireForm(formId, successId, errorId) {
  const form = document.getElementById(formId);
  const success = document.getElementById(successId);
  const error = document.getElementById(errorId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (error) error.classList.remove('is-visible');
    if (success) success.classList.remove('is-visible');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Envoi en cours…'; }

    try {
      const data = new FormData(form);
      const res = await fetch(`https://formsubmit.co/ajax/${FORM_TARGET_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      if (!res.ok) throw new Error('Envoi impossible');
      if (success) success.classList.add('is-visible');
      form.reset();
    } catch (err) {
      if (error) error.classList.add('is-visible');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
    }
  });
}
wireForm('contactForm', 'formSuccessContact', 'formErrorContact');
wireForm('oppForm', 'formSuccessOpp', 'formErrorOpp');

// Léger effet de parallax sur les motifs décoratifs du hero
const heroDecor = document.querySelector('.hero-decor');
if (heroDecor && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  window.addEventListener('scroll', () => {
    heroDecor.style.transform = `translateY(${window.scrollY * 0.15}px)`;
  }, { passive: true });
}

// Ombre sous l'en-tête au scroll
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const toggleHeaderShadow = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  toggleHeaderShadow();
  window.addEventListener('scroll', toggleHeaderShadow, { passive: true });
}

// Animation d'apparition au scroll. Sans JS, ces éléments restent visibles
// normalement (la classe "reveal" qui les rend transparents n'est ajoutée
// qu'ici) : rien ne peut donc rester invisible si ce script échoue.
// Un filet de sécurité force aussi tout à s'afficher après 2,5 s au cas où.
const revealTargets = document.querySelectorAll(
  '.card, .pillar, .cta-banner, .office-card, .accordion-item, .form-card'
);
if (revealTargets.length) {
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  setTimeout(() => {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }, 2500);
}

// Compteurs animés (statistiques du hero)
document.querySelectorAll('[data-count-to]').forEach((el) => {
  const target = parseFloat(el.dataset.countTo);
  const suffix = el.dataset.countSuffix || '';
  const duration = 1400;
  let started = false;

  const run = () => {
    if (started) return;
    started = true;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { run(); obs.unobserve(entry.target); } });
    }, { threshold: 0.4 });
    obs.observe(el);
  } else {
    run();
  }
  // Filet de sécurité : si jamais l'observateur ne se déclenche pas.
  setTimeout(run, 2500);
});
