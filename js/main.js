/* Paste the Apps Script deployment URL here (backend/Code.gs → Deploy → Web app URL) */
var BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwGUR6P2oXT_MXko2hfSQN1g1Vjp5d7yigt4FhrjYR6CRpd8S9xHsyoE7twfBup8cE/exec';

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

/* profession "Other" toggle */
function bindOtherProfession(selectId, inputId) {
  var sel = document.getElementById(selectId);
  var inp = document.getElementById(inputId);
  if (!sel || !inp) return;
  sel.addEventListener('change', function() {
    var show = sel.value === 'Other';
    inp.style.display = show ? 'block' : 'none';
    inp.required = show;
    if (!show) inp.value = '';
  });
}
bindOtherProfession('inviteProfession',   'inviteOtherProfession');
bindOtherProfession('nominateProfession', 'nominateOtherProfession');

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
    if (formData.get('profession') === 'Other') {
      formData.set('profession', formData.get('professionOther') || 'Other');
    }
    formData.delete('professionOther');
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
