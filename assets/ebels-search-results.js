/* ==========================================================================
   EBELS SEARCH RESULTS — AJAX add-to-bag
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-add-to-bag-sr]').forEach(function (btn) {
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
})();
