(function () {
  'use strict';

  var root = document.querySelector('[data-account-tab-panel="profile"]');
  if (!root && !document.querySelector('[data-modal="profile-info-modal"]')) return;

  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-modal-open');
      var modal = document.querySelector('[data-modal="' + id + '"]');
      if (modal) modal.hidden = false;
    });
  });

  document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = btn.closest('[data-modal]');
      if (modal) modal.hidden = true;
    });
  });

  var submittableForms = document.querySelectorAll(
    '.ebels-acc-modal__form, .ebels-acc-address-item__remove-form'
  );

  submittableForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving…';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function () {
          window.location.reload();
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        });
    });
  });

  var marketingToggle = document.querySelector('[data-marketing-toggle]');
  if (marketingToggle) {
    marketingToggle.addEventListener('change', function () {
      var form = marketingToggle.closest('form');
      if (!form) return;

      var formData = new FormData(form);
      if (!marketingToggle.checked) {
        formData.set('customer[accepts_marketing]', '0');
      }

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      }).catch(function () {
        marketingToggle.checked = !marketingToggle.checked;
      });
    });
  }

  document.querySelectorAll('.ebels-acc-modal__form').forEach(function (form) {
    function updateSaveState() {
      var saveBtn = form.querySelector('.ebels-acc-modal__save');
      if (!saveBtn) return;
      saveBtn.classList.toggle('is-ready', form.checkValidity());
    }
    updateSaveState();
    form.addEventListener('input', updateSaveState);
  });
})();
