/* ==========================================================================
   EBELS COMPLETE THE LOOK — AJAX add-to-bag
   Same pattern as ebels-product.js, scoped to this section's cards.
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-complete-look-section]').forEach(function (root) {
    root.querySelectorAll('[data-add-to-bag-ctl]').forEach(initButton);
  });

  function initButton(btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;

      var variantId = btn.getAttribute('data-variant-id');
      if (!variantId) return;

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
          updateCartCount();
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
  }

  function updateCartCount() {
    fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
        });
      });
  }
})();
