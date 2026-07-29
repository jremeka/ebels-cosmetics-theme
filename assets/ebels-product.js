/* ==========================================================================
   EBELS PRODUCT — Hero interactions
   Gallery swap · swatch → variant matching · quantity stepper ·
   AJAX add-to-bag · wishlist toggle stub
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-product-section]').forEach(initProductSection);

  function initProductSection(root) {
    var jsonEl = root.querySelector('[data-product-json]');
    var product = null;
    try {
      product = jsonEl ? JSON.parse(jsonEl.textContent) : null;
    } catch (e) {
      product = null;
    }

    initGallery(root);
    initSwatches(root, product);
    initQtyStepper(root);
    initAddToBag(root);
    initWishlist(root);
    trackRecentlyViewed(product);
  }

  /* ----- Recently viewed tracking -----
     Records this product in localStorage so ebels-recently-viewed.js can
     read it back later. Runs on every product page automatically. */
  function trackRecentlyViewed(product) {
    if (!product || !product.handle) return;

    var STORAGE_KEY = 'ebels:recently-viewed';
    var MAX_ITEMS = 12;
    var stored = [];

    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      stored = [];
    }

    // Remove any existing entry for this product, then add it fresh to the front
    stored = stored.filter(function (item) { return item.handle !== product.handle; });
    stored.unshift({ handle: product.handle, viewedAt: Date.now() });
    stored = stored.slice(0, MAX_ITEMS);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      // Storage unavailable (private browsing, storage full, etc.) — fail silently
    }
  }

  /* ----- Gallery ----- */
  function initGallery(root) {
    var thumbs = root.querySelectorAll('[data-gallery-thumb]');
    var images = root.querySelectorAll('[data-gallery-image]');
    if (!thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var index = thumb.getAttribute('data-index');
        showImage(index);
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });

    function showImage(index) {
      images.forEach(function (img) {
        var isMatch = img.getAttribute('data-index') === index;
        img.hidden = !isMatch;
        img.classList.toggle('is-active', isMatch);
      });
    }

    // exposed for swatch-triggered image swap
    root._ebelsShowGalleryImage = showImage;
  }

  /* ----- Swatches → variant lookup ----- */
  function initSwatches(root, product) {
    var group = root.querySelector('[data-swatch-group]');
    if (!group || !product) return;

    var swatches = group.querySelectorAll('[data-swatch-value]');
    var selectedLabel = group.querySelector('[data-swatch-selected-label]');
    var nativeSelect = root.querySelector('[data-native-variant-select]');
    var priceEl = root.querySelector('[data-product-price]');
    var addToBagBtn = root.querySelector('[data-add-to-bag]');
    var optionName = swatches.length ? swatches[0].getAttribute('data-swatch-option-name') : null;
    if (!optionName) return;

    var optionIndex = (product.options || []).indexOf(optionName);

    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        swatches.forEach(function (s) { s.classList.remove('is-selected'); });
        swatch.classList.add('is-selected');

        var value = swatch.getAttribute('data-swatch-value');
        if (selectedLabel) selectedLabel.textContent = value;

        var matched = findVariant(product, optionIndex, value);
        if (!matched) return;

        if (nativeSelect) nativeSelect.value = matched.id;
        if (priceEl) priceEl.textContent = formatMoney(matched.price);
        if (addToBagBtn) {
          addToBagBtn.setAttribute('data-variant-id', matched.id);
          var available = matched.available;
          addToBagBtn.disabled = !available;
          addToBagBtn.textContent = available ? 'Add to Bag' : 'Sold Out';
        }

        if (matched.featured_image && root._ebelsShowGalleryImage) {
          var imageMatch = root.querySelector(
            '[data-gallery-image][src*="' + matched.featured_image.src.split('?')[0].split('/').pop().split('.')[0] + '"]'
          );
          if (imageMatch) {
            var thumbMatch = root.querySelector('[data-gallery-thumb][data-index="' + imageMatch.getAttribute('data-index') + '"]');
            root._ebelsShowGalleryImage(imageMatch.getAttribute('data-index'));
            root.querySelectorAll('[data-gallery-thumb]').forEach(function (t) { t.classList.remove('is-active'); });
            if (thumbMatch) thumbMatch.classList.add('is-active');
          }
        }
      });
    });

    function findVariant(product, optIndex, value) {
      if (optIndex < 0) return null;
      return (product.variants || []).find(function (v) {
        return v.options[optIndex] === value;
      });
    }

    function formatMoney(cents) {
      var formatEl = root.querySelector('[data-money-format]') || document.querySelector('[data-money-format]');
      var format = '${{amount}}';
      if (formatEl) {
        try {
          format = JSON.parse(formatEl.textContent) || format;
        } catch (e) {
          // Keep the fallback format if parsing fails
        }
      }
      var value = (cents / 100).toFixed(2);
      return format.replace(/\{\{\s*amount\s*\}\}/, value);
    }
  }

  /* ----- Quantity stepper ----- */
  function initQtyStepper(root) {
    var stepper = root.querySelector('[data-qty-stepper]');
    if (!stepper) return;
    var input = stepper.querySelector('[data-qty-input]');
    var decrease = stepper.querySelector('[data-qty-decrease]');
    var increase = stepper.querySelector('[data-qty-increase]');

    decrease.addEventListener('click', function () {
      var val = Math.max(1, parseInt(input.value, 10) - 1 || 1);
      input.value = val;
    });
    increase.addEventListener('click', function () {
      var val = (parseInt(input.value, 10) || 1) + 1;
      input.value = val;
    });
    input.addEventListener('change', function () {
      var val = Math.max(1, parseInt(input.value, 10) || 1);
      input.value = val;
    });
  }

  /* ----- AJAX add to bag ----- */
  function initAddToBag(root) {
    var btn = root.querySelector('[data-add-to-bag]');
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (btn.disabled) return;

      var variantId = btn.getAttribute('data-variant-id') || root.getAttribute('data-current-variant-id');
      var nativeSelect = root.querySelector('[data-native-variant-select]');
      if (!variantId && nativeSelect) variantId = nativeSelect.value;

      var qtyInput = root.querySelector('[data-qty-input]');
      var quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

      btn.disabled = true;
      var originalText = btn.textContent;
      btn.textContent = 'Adding…';

      fetch(window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root + 'cart/add.js'
        : '/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: quantity })
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

    function updateCartCount() {
      fetch('/cart.js')
        .then(function (res) { return res.json(); })
        .then(function (cart) {
          document.querySelectorAll('[data-cart-count]').forEach(function (el) {
            el.textContent = cart.item_count;
          });
        });
    }
  }

  /* ----- Wishlist — real persistence via ebels-wishlist.js ----- */
  function initWishlist(root) {
    var btn = root.querySelector('[data-wishlist-toggle]');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));

      // Rebuild icon + label
      btn.innerHTML = '<svg class="ebels-product__wishlist-icon" width="16" height="16" viewBox="0 0 24 24" '
        + 'fill="none" stroke="currentColor" stroke-width="2">'
        + '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>'
        + '</svg>' + (!pressed ? 'Added to Wishlist' : 'Add to Wishlist');

      root.dispatchEvent(new CustomEvent('ebels:wishlist-toggle', {
        bubbles: true,
        detail: { handle: btn.getAttribute('data-product-handle'), added: !pressed }
      }));
    });
  }
})();
