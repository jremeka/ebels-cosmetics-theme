/* ==========================================================================
   EBELS COLLECTION GRID — interactions
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-collection-grid]').forEach(initGrid);

  function initGrid(root) {
    initSortDropdown(root);
    initAddToBag(root);
    initSwatches(root);
  }

  /* ----- Swatch click: swap image, price, and Add to Bag target ----- */
  function initSwatches(root) {
    var moneyFormat = readMoneyFormat(root);

    root.querySelectorAll('[data-cg-swatches]').forEach(function (group) {
      var card = group.closest('[data-cg-card]');
      if (!card) return;

      var swatches = group.querySelectorAll('[data-cg-swatch-value]');
      var priceEl = card.querySelector('[data-cg-price]');
      var addToBagBtn = card.querySelector('[data-add-to-bag-cg]');
      var primaryImg = card.querySelector('.ebels-cg__img--primary');
      var hoverImg = card.querySelector('.ebels-cg__img--hover');
      var variantImages = card.querySelectorAll('[data-cg-variant-image]');

      swatches.forEach(function (swatch) {
        swatch.addEventListener('click', function () {
          swatches.forEach(function (s) { s.classList.remove('is-selected'); });
          swatch.classList.add('is-selected');

          var price = swatch.getAttribute('data-cg-variant-price');
          var variantId = swatch.getAttribute('data-cg-variant-id');
          var available = swatch.getAttribute('data-cg-variant-available') === 'true';

          if (priceEl && price) {
            priceEl.textContent = formatMoney(parseInt(price, 10), moneyFormat);
          }

          if (addToBagBtn && variantId) {
            addToBagBtn.setAttribute('data-variant-id', variantId);
            addToBagBtn.disabled = !available;
            addToBagBtn.textContent = available ? 'Add to Bag' : 'Sold Out';
          }

          // Swap to this variant's own image if one was uploaded for it
          var matchedImage = null;
          variantImages.forEach(function (img) {
            if (img.getAttribute('data-cg-variant-image') === variantId) matchedImage = img;
          });

          if (matchedImage && primaryImg) {
            primaryImg.src = matchedImage.src;
            primaryImg.srcset = '';
            if (hoverImg) hoverImg.style.opacity = '0';
          }
        });
      });
    });
  }

  function readMoneyFormat(root) {
    var el = root.querySelector('[data-money-format]');
    var fallback = '${{amount}}';
    if (!el) return fallback;
    try {
      return JSON.parse(el.textContent) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function formatMoney(cents, format) {
    var value = (cents / 100).toFixed(2);
    return format.replace(/\{\{\s*amount\s*\}\}/, value);
  }

  /* ----- Sort dropdown ----- */
  function initSortDropdown(root) {
    var wrap = root.querySelector('[data-sort-dropdown]');
    if (!wrap) return;

    var trigger = wrap.querySelector('[data-sort-trigger]');
    var menu = wrap.querySelector('[data-sort-menu]');
    var options = wrap.querySelectorAll('[data-sort-option]');

    trigger.addEventListener('click', function () {
      var isOpen = !menu.hidden;
      menu.hidden = isOpen;
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) {
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    options.forEach(function (option) {
      var ratingDirection = option.getAttribute('data-rating-sort');
      if (!ratingDirection) return; // real links (price/best-selling) navigate normally

      option.addEventListener('click', function (e) {
        e.preventDefault();
        sortByRating(root, ratingDirection);
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- Rating sort (client-side, reorders currently loaded cards) -----
     Placeholder data-rating values are identical right now, so this won't
     visibly reorder anything until a real review app populates per-product
     ratings into the data-rating attribute on each card. The mechanism
     itself is fully functional and ready for that. */
  function sortByRating(root, direction) {
    var list = root.querySelector('[data-cg-product-list]');
    if (!list) return;

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-cg-card]'));
    cards.sort(function (a, b) {
      var ratingA = parseFloat(a.getAttribute('data-rating')) || 0;
      var ratingB = parseFloat(b.getAttribute('data-rating')) || 0;
      return direction === 'asc' ? ratingA - ratingB : ratingB - ratingA;
    });

    cards.forEach(function (card) { list.appendChild(card); });
  }

  /* ----- AJAX add to bag ----- */
  function initAddToBag(root) {
    root.querySelectorAll('[data-add-to-bag-cg]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
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
            updateCartCount();
            if (window.EbelsCartDrawer) window.EbelsCartDrawer.open();
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