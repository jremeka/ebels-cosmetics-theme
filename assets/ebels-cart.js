/* ==========================================================================
   EBELS SHOPPING BAG — full page interactions
   ========================================================================== */

(function () {
  'use strict';

  var root = document.querySelector('[data-cart-page]');
  if (!root) return;

  var list = root.querySelector('[data-cart-list]');
  var selectAll = root.querySelector('[data-cart-select-all]');
  var removeSelectedBtn = root.querySelector('[data-cart-remove-selected]');
  var subtotalEl = root.querySelector('[data-cart-subtotal]');
  var totalEl = root.querySelector('[data-cart-total]');
  var promoInput = root.querySelector('[data-cart-promo-input]');
  var promoBtn = root.querySelector('[data-cart-promo-apply]');
  var moneyFormat = readMoneyFormat();

  if (list) bindAllItems();
  if (selectAll) initSelectAll();
  if (removeSelectedBtn) initRemoveSelected();
  if (promoBtn) initPromo();

  /* ----- Per-item qty/remove ----- */
  function bindAllItems() {
    list.querySelectorAll('[data-cart-item]').forEach(bindItem);
  }

  function bindItem(itemEl) {
    var key = itemEl.getAttribute('data-line-key');
    var qtyValueEl = itemEl.querySelector('[data-cart-qty-value]');
    var decreaseBtn = itemEl.querySelector('[data-cart-qty-decrease]');
    var increaseBtn = itemEl.querySelector('[data-cart-qty-increase]');
    var removeBtn = itemEl.querySelector('[data-cart-remove]');

    decreaseBtn.addEventListener('click', function () {
      var newQty = Math.max(0, parseInt(qtyValueEl.textContent, 10) - 1);
      changeLine(key, newQty, itemEl);
    });

    increaseBtn.addEventListener('click', function () {
      var newQty = parseInt(qtyValueEl.textContent, 10) + 1;
      changeLine(key, newQty, itemEl);
    });

    removeBtn.addEventListener('click', function () {
      changeLine(key, 0, itemEl);
    });
  }

  function changeLine(key, quantity, itemEl) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        if (quantity === 0) {
          itemEl.remove();
        } else {
          var updatedItem = cart.items.filter(function (i) { return i.key === key; })[0];
          if (updatedItem) {
            itemEl.querySelector('[data-cart-qty-value]').textContent = updatedItem.quantity;
            var priceEl = itemEl.querySelector('[data-cart-item-line-price]');
            if (priceEl) priceEl.textContent = formatMoney(updatedItem.final_line_price);
          }
        }

        updateTotals(cart);
        syncHeaderAndDrawer(cart);

        if (cart.item_count === 0) {
          window.location.reload(); // show the empty-cart state cleanly
        }
      })
      .catch(function () {
        window.location.reload(); // fall back to a real reload if something goes wrong, rather than show stale data
      });
  }

  function updateTotals(cart) {
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
    if (totalEl) totalEl.textContent = formatMoney(cart.total_price);
  }

  function syncHeaderAndDrawer(cart) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = cart.item_count;
    });
    if (window.EbelsCartDrawer && typeof window.EbelsCartDrawer.refresh === 'function') {
      window.EbelsCartDrawer.refresh();
    }
  }

  /* ----- Select all / remove selected -----
     Note: this controls bulk REMOVAL only. Shopify's checkout always includes
     the entire cart — there's no native "buy only some items" mechanism, so
     these checkboxes intentionally don't affect what gets purchased. */
  function initSelectAll() {
    selectAll.addEventListener('change', function () {
      list.querySelectorAll('[data-cart-item-check]').forEach(function (cb) {
        cb.checked = selectAll.checked;
      });
    });
  }

  function initRemoveSelected() {
    removeSelectedBtn.addEventListener('click', function () {
      var checkedItems = Array.prototype.filter.call(
        list.querySelectorAll('[data-cart-item]'),
        function (itemEl) {
          var cb = itemEl.querySelector('[data-cart-item-check]');
          return cb && cb.checked;
        }
      );

      if (!checkedItems.length) return;

      var updates = {};
      checkedItems.forEach(function (itemEl) {
        updates[itemEl.getAttribute('data-line-key')] = 0;
      });

      fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: updates })
      })
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          checkedItems.forEach(function (itemEl) { itemEl.remove(); });
          updateTotals(cart);
          syncHeaderAndDrawer(cart);
          if (cart.item_count === 0) window.location.reload();
        })
        .catch(function () {
          window.location.reload();
        });
    });
  }

  /* ----- Promo code -----
     Uses Shopify's native discount URL — no app required. This is a real
     page navigation (not AJAX) since Shopify doesn't expose a public AJAX
     endpoint for validating discount codes. */
  function initPromo() {
    promoBtn.addEventListener('click', function () {
      var code = (promoInput.value || '').trim();
      if (!code) return;
      window.location.href = '/discount/' + encodeURIComponent(code) + '?redirect=' + encodeURIComponent('/cart');
    });

    promoInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        promoBtn.click();
      }
    });
  }

  /* ----- Helpers ----- */
  function readMoneyFormat() {
    var el = root.querySelector('[data-money-format]');
    var fallback = '${{amount}}';
    if (!el) return fallback;
    try {
      return JSON.parse(el.textContent) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function formatMoney(cents) {
    var value = (cents / 100).toFixed(2);
    return moneyFormat.replace(/\{\{\s*amount\s*\}\}/, value);
  }
})();
