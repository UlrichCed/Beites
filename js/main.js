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
  const hide = () => { img.style.display = 'none'; };
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
