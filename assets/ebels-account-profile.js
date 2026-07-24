/* ==========================================================================
   EBELS ACCOUNT — Profile tab
   Handles opening/closing the Add/Edit Address modals, PLUS submitting all
   address forms (add/edit/remove) via fetch instead of a normal browser
   form submission. Shopify's classic customer_address form redirects to
   its own native /account/addresses page on success by default — since
   we're using this form on our own custom branded page instead, a normal
   submission would kick the person out to that unbranded page. Submitting
   via fetch() means the browser's URL never changes, so they stay right
   here the whole time. The main profile form (name/email/beauty profile)
   is left as a normal native submission since that one already redirects
   back correctly on its own.
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-address-modal-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-address-modal-open');
      var modal = document.querySelector('[data-address-modal="' + targetId + '"]');
      if (modal) {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
      }
    });
  });

  document.querySelectorAll('[data-address-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = btn.closest('[data-address-modal]');
      if (modal) {
        modal.hidden = true;
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('[data-address-modal]:not([hidden])').forEach(function (modal) {
      modal.hidden = true;
      document.body.style.overflow = '';
    });
  });

  /* ----- Submit address forms (add/edit) via fetch, stay on this page ----- */
  document.querySelectorAll('.ebels-acc-modal__form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitAddressForm(form);
    });
  });

  /* ----- Submit the "Remove" mini-forms the same way ----- */
  document.querySelectorAll('.ebels-acc-prof__remove-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!confirm('Remove this address?')) return;
      submitAddressForm(form);
    });
  });

  function submitAddressForm(form) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';
    }

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(function () {
        // Reload THIS page (URL never changed, so this reloads our branded
        // page, not Shopify's native one) to show the updated address list.
        window.location.reload();
      })
      .catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        alert('Something went wrong saving that address. Please try again.');
      });
  }
})();