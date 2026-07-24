/* ==========================================================================
   EBELS ACCOUNT — For You tab interactions
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-add-to-bag-fy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;

      var variantId = btn.getAttribute('data-variant-id');
      var originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Adding…';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          btn.textContent = 'Added ✓';
          btn.classList.add('is-added');

          if (window.EbelsCartDrawer && typeof window.EbelsCartDrawer.open === 'function') {
            window.EbelsCartDrawer.open();
          }

          setTimeout(function () {
            btn.textContent = originalText;
            btn.classList.remove('is-added');
            btn.disabled = false;
          }, 1800);
        })
        .catch(function () {
          btn.textContent = originalText;
          btn.disabled = false;
        });
    });
  });

  // "Edit Profile" link jumps to the Profile tab via the header's tab trigger
  document.querySelectorAll('[data-account-goto-profile]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var profileTrigger = document.querySelector('[data-account-tab-trigger][data-tab-target="profile"]');
      if (profileTrigger) profileTrigger.click();
    });
  });
})();
