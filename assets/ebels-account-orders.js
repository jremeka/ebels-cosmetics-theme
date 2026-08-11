/* ==========================================================================
   EBELS ACCOUNT — Orders tab interactions
   ========================================================================== */

(function () {
  'use strict';

  initReorderButtons();
  initFavouritesAddToBag();
  initOrderDetailsToggle();

  /* ----- Reorder: adds every line item from that order back to cart ----- */
  function initReorderButtons() {
    document.querySelectorAll('[data-account-reorder]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var orderId = btn.getAttribute('data-order-id');
        var dataEl = document.querySelector('[data-order-lines="' + orderId + '"]');
        if (!dataEl) return;

        var lines;
        try {
          lines = JSON.parse(dataEl.textContent);
        } catch (e) {
          return;
        }

        var originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Adding…';

        var items = lines
          .filter(function (l) { return l.variant_id; })
          .map(function (l) { return { id: l.variant_id, quantity: l.quantity }; });

        if (!items.length) {
          btn.disabled = false;
          btn.textContent = originalText;
          return;
        }

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items })
        })
          .then(function (res) { return res.json(); })
          .then(function () {
            btn.textContent = 'Added to Bag ✓';

            if (window.EbelsCartDrawer && typeof window.EbelsCartDrawer.open === 'function') {
              window.EbelsCartDrawer.open();
            }

            setTimeout(function () {
              btn.textContent = originalText;
              btn.disabled = false;
            }, 2000);
          })
          .catch(function () {
            btn.textContent = 'Some items unavailable';
            setTimeout(function () {
              btn.textContent = originalText;
              btn.disabled = false;
            }, 2000);
          });
      });
    });
  }

  /* ----- Favourites Add to Bag ----- */
  function initFavouritesAddToBag() {
    document.querySelectorAll('[data-add-to-bag-fav]').forEach(function (btn) {
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
  }

  /* ----- Order details: toggles the inline detail panel open/closed ----- */
  function initOrderDetailsToggle() {
    document.querySelectorAll('[data-order-details-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panelId = btn.getAttribute('aria-controls');
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        var isOpen = !panel.hidden;
        panel.hidden = isOpen;
        btn.setAttribute('aria-expanded', String(!isOpen));
        btn.textContent = isOpen ? 'View Details' : 'Hide Details';
      });
    });
  }
})();
