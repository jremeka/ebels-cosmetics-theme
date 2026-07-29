/* ==========================================================================
   EBELS SEARCH EMPTY — random "You Might Like" picks + interactions
   Liquid has no true random function (pages are cached, so genuine
   per-visit randomness isn't reliable server-side). Instead: a real pool
   of up to 24 products is embedded server-side, and this script shuffles
   it and renders 4 different ones on every page load.
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-search-empty-section]').forEach(initSection);

  function initSection(root) {
    var grid = root.querySelector('[data-search-empty-grid]');
    var poolEl = root.querySelector('[data-search-empty-pool]');
    if (!grid || !poolEl) return;

    var pool;
    try {
      pool = JSON.parse(poolEl.textContent);
    } catch (e) {
      pool = [];
    }

    if (!pool.length) return;

    var moneyFormat = readMoneyFormat(root);
    var picks = shuffle(pool).slice(0, 4);

    grid.innerHTML = picks.map(function (p) { return renderCard(p, moneyFormat); }).join('');
    initCardInteractions(grid);
  }

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function renderCard(product, moneyFormat) {
    var title = escapeHtml(product.title);
    var price = formatMoney(product.price, moneyFormat);
    var image = product.image || '';

    return ''
      + '<div class="ebels-se__card">'
      +   '<button type="button" class="ebels-se__wishlist" data-search-empty-wishlist aria-label="Add to wishlist" aria-pressed="false">'
      +     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>'
      +   '</button>'
      +   '<a href="' + product.url + '" class="ebels-se__media-link">'
      +     '<div class="ebels-se__media">'
      +       (image ? '<img src="' + image + '" alt="' + title + '" class="ebels-se__img" loading="lazy">' : '')
      +     '</div>'
      +   '</a>'
      +   '<a href="' + product.url + '" class="ebels-se__title-link"><h3 class="ebels-se__title">' + title + '</h3></a>'
      +   '<p class="ebels-se__price">' + price + '</p>'
      +   '<a href="' + product.url + '" class="ebels-se__add-to-bag"' + (product.available ? '' : ' aria-disabled="true"') + '>'
      +     (product.available ? 'View Product' : 'Sold Out')
      +   '</a>'
      + '</div>';
  }

  function initCardInteractions(grid) {
    grid.querySelectorAll('[data-search-empty-wishlist]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));
        document.dispatchEvent(new CustomEvent('ebels:wishlist-toggle', {
          bubbles: true,
          detail: { added: !pressed }
        }));
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

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
})();
