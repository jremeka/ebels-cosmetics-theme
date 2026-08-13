/* ==========================================================================
   EBELS RECENTLY VIEWED
   Reads the history saved by ebels-product.js (trackRecentlyViewed), fetches
   fresh data for each product via Shopify's product JSON endpoint, and
   renders cards. Section stays hidden entirely if there's no history yet.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'ebels:recently-viewed';

  document.querySelectorAll('[data-recently-viewed-section]').forEach(initSection);

  function initSection(root) {
    var currentHandle = root.getAttribute('data-current-handle');
    var maxToShow = parseInt(root.getAttribute('data-products-to-show'), 10) || 4;
    var grid = root.querySelector('[data-rv-grid]');
    if (!grid) return;

    var stored = readHistory();
    var handles = stored
      .filter(function (item) { return item.handle !== currentHandle; })
      .slice(0, maxToShow)
      .map(function (item) { return item.handle; });

    if (!handles.length) {
      return; // stays hidden — first-time visitor or nothing else viewed yet
    }

    // Show skeleton placeholders immediately so the layout doesn't jump once real cards land
    grid.innerHTML = handles.map(function () {
      return '<div class="ebels-rv__skeleton"></div>';
    }).join('');
    root.hidden = false;

    Promise.all(handles.map(fetchProduct)).then(function (products) {
      var validProducts = products.filter(Boolean);

      if (!validProducts.length) {
        root.hidden = true;
        return;
      }

      var moneyFormat = readMoneyFormat(root);
      grid.innerHTML = validProducts.map(function (p) { return renderCard(p, moneyFormat); }).join('');
      initAddToBagButtons(grid);
    });
  }

  function readHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
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

  function fetchProduct(handle) {
    return fetch('/products/' + handle + '.js')
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; });
  }

  function formatMoney(cents, format) {
    var value = (cents / 100).toFixed(2);
    return format.replace(/\{\{\s*amount\s*\}\}/, value);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function isComingSoon(product) {
    return !!(product.tags && product.tags.indexOf('Coming Soon') !== -1);
  }

  function renderCard(product, moneyFormat) {
    var variant = (product.variants && product.variants[0]) || {};
    var imageSrc = product.featured_image || (product.images && product.images[0]) || '';
    var price = formatMoney(variant.price || 0, moneyFormat);
    var available = !!variant.available;
    var comingSoon = !available && isComingSoon(product);
    var title = escapeHtml(product.title);
    var url = '/products/' + product.handle;

    var buttonLabel = available ? 'Add to Bag' : (comingSoon ? 'Coming Soon' : 'Sold Out');

    return ''
      + '<div class="ebels-rv__card">'
      +   '<a href="' + url + '" class="ebels-rv__media-link" aria-label="' + title + '">'
      +     '<div class="ebels-rv__media">'
      +       (imageSrc
                ? '<img src="' + imageSrc + '&width=600" alt="' + title + '" class="ebels-rv__img" loading="lazy" width="600" height="600">'
                : '')
      +     '</div>'
      +   '</a>'
      +   '<div class="ebels-rv__info">'
      +     '<a href="' + url + '" class="ebels-rv__title-link"><h3 class="ebels-rv__title">' + title + '</h3></a>'
        +     '<p class="ebels-rv__price">' + price + '</p>'
      +     '<div class="ebels-rv__rating">'
      +       "<div class='jdgm-widget jdgm-preview-badge' data-id='" + product.id + "' data-auto-install='false'></div>"
      +     '</div>'

      +     '<button type="button" class="ebels-btn ebels-btn--outline ebels-rv__add-to-bag" data-add-to-bag-rv data-variant-id="' + variant.id + '"' + (available ? '' : ' disabled') + '>'
      +       buttonLabel
      +     '</button>'
      +   '</div>'
      + '</div>';
  }

  function initAddToBagButtons(grid) {
    grid.querySelectorAll('[data-add-to-bag-rv]').forEach(function (btn) {
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
