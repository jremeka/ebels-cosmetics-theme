/* ==========================================================================
   EBELS CART DRAWER
   Defines window.EbelsCartDrawer = { open, close, refresh } — this exact API
   is already called from ebels-product.js, ebels-complete-look.js,
   ebels-collection-grid.js, and ebels-recently-viewed.js after a successful
   add-to-bag, so this file must keep that contract.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.querySelector('[data-cart-drawer]');
  if (!root) return;

  var overlay = root.querySelector('[data-cart-drawer-overlay]');
  var body = root.querySelector('[data-cart-drawer-body]');
  var footer = root.querySelector('[data-cart-drawer-footer]');
  var countEl = root.querySelector('[data-cart-drawer-count]');
  var subtotalEl = root.querySelector('[data-cart-drawer-subtotal]');
  var shippingMsgEl = root.querySelector('[data-cart-drawer-shipping-msg]');
  var closeButtons = root.querySelectorAll('[data-cart-drawer-close]');

  var threshold = parseFloat(root.getAttribute('data-free-shipping-threshold')) || 50;
  var emptyMessage = root.getAttribute('data-empty-message') || 'Your bag is empty.';
  var moneyFormat = readMoneyFormat();

  /* ----- Public API ----- */
  window.EbelsCartDrawer = {
    open: function () {
      refresh().then(show);
    },
    close: hide,
    refresh: refresh
  };

  /* ----- Open triggers: header cart icon ----- */
  var cartIcon = document.getElementById('cart-icon-bubble');
  if (cartIcon) {
    var trigger = cartIcon.closest('a') || cartIcon;
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      window.EbelsCartDrawer.open();
    });
  }

  closeButtons.forEach(function (btn) {
    btn.addEventListener('click', hide);
  });

  overlay.addEventListener('click', hide);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !root.hidden) hide();
  });

  /* ----- Show / hide ----- */
  function show() {
    root.hidden = false;
    document.body.classList.add('ebels-cd-open');
  }

  function hide() {
    root.hidden = true;
    document.body.classList.remove('ebels-cd-open');
  }

  /* ----- Fetch + render ----- */
  function refresh() {
    return fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(renderCart)
      .catch(function () {
        // Cart fetch failed — leave drawer showing its last known state rather than breaking
      });
  }

  function renderCart(cart) {
    if (countEl) countEl.textContent = cart.item_count;
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = cart.item_count;
    });

    renderShippingMessage(cart.total_price);

    if (!cart.items.length) {
      body.innerHTML = '<div class="ebels-cd__empty"><p class="ebels-body">' + emptyMessage + '</p></div>';
      footer.hidden = true;
      return;
    }

    footer.hidden = false;
    body.innerHTML = cart.items.map(renderItem).join('');
    bindItemEvents();
  }

  function renderShippingMessage(totalCents) {
    if (!shippingMsgEl) return;
    var totalDollars = totalCents / 100;

    if (totalDollars >= threshold) {
      // shippingMsgEl.textContent = "🚚 You've unlocked free shipping!";
    } else {
      var remaining = (threshold - totalDollars).toFixed(2);
      shippingMsgEl.textContent = '🚚 You\'re $' + remaining + ' away from free shipping!';
    }
  }

  function renderItem(item) {
    var image = item.image || '';
    var variantText = (item.variant_title && item.variant_title !== 'Default Title')
      ? '<p class="ebels-cd__item-variant">' + escapeHtml(item.variant_title) + '</p>'
      : '';

    var hasCompare = item.original_price && item.original_price > item.price;
    var priceHtml = '<span>' + formatMoney(item.price) + '</span>'
      + (hasCompare ? '<span class="ebels-cd__item-price-compare">' + formatMoney(item.original_price) + '</span>' : '');

    return ''
      + '<div class="ebels-cd__item" data-cd-line-key="' + item.key + '">'
      +   '<div class="ebels-cd__item-media">'
      +     (image ? '<img src="' + image + '&width=200" alt="' + escapeHtml(item.product_title) + '" loading="lazy">' : '')
      +   '</div>'
      +   '<div class="ebels-cd__item-info">'
      +     '<a href="' + item.url + '" class="ebels-cd__item-title">' + escapeHtml(item.product_title) + '</a>'
      +     variantText
      +     '<div class="ebels-cd__item-price">' + priceHtml + '</div>'
      +     '<div class="ebels-cd__item-row">'
      +       '<div class="ebels-cd__qty-stepper">'
      +         '<button type="button" class="ebels-cd__qty-btn" data-cd-qty-decrease aria-label="Decrease quantity">–</button>'
      +         '<span class="ebels-cd__qty-value" data-cd-qty-value>' + item.quantity + '</span>'
      +         '<button type="button" class="ebels-cd__qty-btn" data-cd-qty-increase aria-label="Increase quantity">+</button>'
      +       '</div>'
      +       '<button type="button" class="ebels-cd__remove" data-cd-remove>Remove</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function bindItemEvents() {
    body.querySelectorAll('[data-cd-line-key]').forEach(function (itemEl) {
      var key = itemEl.getAttribute('data-cd-line-key');
      var qtyValueEl = itemEl.querySelector('[data-cd-qty-value]');
      var decreaseBtn = itemEl.querySelector('[data-cd-qty-decrease]');
      var increaseBtn = itemEl.querySelector('[data-cd-qty-increase]');
      var removeBtn = itemEl.querySelector('[data-cd-remove]');

      decreaseBtn.addEventListener('click', function () {
        var newQty = Math.max(0, parseInt(qtyValueEl.textContent, 10) - 1);
        changeLine(key, newQty);
      });

      increaseBtn.addEventListener('click', function () {
        var newQty = parseInt(qtyValueEl.textContent, 10) + 1;
        changeLine(key, newQty);
      });

      removeBtn.addEventListener('click', function () {
        changeLine(key, 0);
      });
    });
  }

  function changeLine(key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(function (res) { return res.json(); })
      .then(renderCart)
      .catch(function () {
        // If this fails, re-fetch to make sure the drawer reflects the real cart state
        refresh();
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

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // Populate item_count/badge on initial page load, without opening the drawer
  refresh();
})();
