/* Paste the Apps Script deployment URL here (backend/Code.gs → Deploy → Web app URL) */
var BACKEND_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

/* wordmark: scroll to top without appending hash */
document.querySelector('.wordmark').addEventListener('click', function(e) {
  e.preventDefault();
  window.scrollTo({top: 0, behavior: 'smooth'});
  history.replaceState(null, '', location.pathname);
});

/* mobile nav toggle */
var navToggle = document.querySelector('.nav-toggle');
var navLinks  = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', function() {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* form submissions */
function handleForm(formId, thanksId, type) {
  var form = document.getElementById(formId);
  if (!form) return;
  form.onsubmit = function(e) {
    e.preventDefault();
    var btn = form.querySelector('button');
    btn.disabled = true;
    btn.innerText = 'Sending…';
    var formData = new FormData(form);
    formData.append('formType', type);
    fetch(BACKEND_URL, {method: 'POST', body: new URLSearchParams(formData)})
      .finally(function() {
        form.style.display = 'none';
        document.getElementById(thanksId).classList.add('show');
      });
  };
}

handleForm('inviteForm',   'inviteThanks',   'Invitation');
handleForm('nominateForm', 'nominateThanks', 'Nomination');

/* reveal on scroll */
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.1});
document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
