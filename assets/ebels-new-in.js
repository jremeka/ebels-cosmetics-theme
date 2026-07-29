/* ==========================================================================
   EBELS NEW IN — interactions
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-add-to-bag-newin]').forEach(function (btn) {
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

  /* ----- Wishlist stub — same deferred pattern as the product page heart button ----- */
  document.querySelectorAll('[data-wishlist-toggle-newin]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));

      document.dispatchEvent(new CustomEvent('ebels:wishlist-toggle', {
        bubbles: true,
        detail: { added: !pressed }
      }));
    });
  });
})();
