/* ==========================================================================
   EBELS WISHLIST — real persistence
   Central, site-wide script. Listens for the ebels:wishlist-toggle event
   (already fired by every heart button across the site) and actually
   saves it this time, using the same localStorage pattern already proven
   by Recently Viewed. Also syncs every button's visual state on page
   load, updates the header badge, and renders the actual Wishlist page
   if one is present.

   CONTRACT: any wishlist button, anywhere on the site, must:
   1. Have both `data-wishlist-btn` and `data-product-handle="{{ product.handle }}"`
   2. On click, dispatch: new CustomEvent('ebels:wishlist-toggle', {
        bubbles: true,
        detail: { handle: <product handle>, added: <true|false> }
      })
   That's the whole interface. This file doesn't care which section fired it.
   ========================================================================== */

(function () {
  'use strict';

  if (window.EbelsWishlist) return; // already initialized elsewhere on this page — don't run twice

  var STORAGE_KEY = 'ebels:wishlist';

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function setWishlist(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // Storage unavailable (private browsing, storage full, etc.) — fail silently
    }
    document.dispatchEvent(new CustomEvent('ebels:wishlist-updated', { detail: { count: list.length } }));
  }

  function isWishlisted(handle) {
    return getWishlist().some(function (item) { return item.handle === handle; });
  }

  function addToWishlist(handle) {
    if (!handle || isWishlisted(handle)) return;
    var list = getWishlist();
    list.unshift({ handle: handle, addedAt: Date.now() });
    setWishlist(list);
  }

  function removeFromWishlist(handle) {
    setWishlist(getWishlist().filter(function (item) { return item.handle !== handle; }));
  }

  // Exposed globally so the wishlist page (and anything else) can use it directly
  window.EbelsWishlist = {
    getAll: getWishlist,
    isWishlisted: isWishlisted,
    add: addToWishlist,
    remove: removeFromWishlist
  };

  /* ----- Central listener: every wishlist button site-wide bubbles up to here ----- */
  document.addEventListener('ebels:wishlist-toggle', function (e) {
    var handle = e.detail && e.detail.handle;
    var added = e.detail && e.detail.added;
    if (!handle) return; // Can't persist without knowing which product — see file header contract

    if (added) {
      addToWishlist(handle);
    } else {
      removeFromWishlist(handle);
    }
  });

  /* ----- Sync every button's visual state on page load -----
     Fixes the real gap where a previously-wishlisted product showed as
     un-hearted on every fresh page load. */
  function syncButtonsOnLoad() {
    var handles = getWishlist().map(function (item) { return item.handle; });

    document.querySelectorAll('[data-wishlist-btn]').forEach(function (btn) {
      var handle = btn.getAttribute('data-product-handle');
      if (!handle) return;
      var active = handles.indexOf(handle) !== -1;
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('is-active', active);
    });

    updateHeaderBadge(handles.length);
  }

  function updateHeaderBadge(count) {
    document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  document.addEventListener('ebels:wishlist-updated', function (e) {
    updateHeaderBadge(e.detail.count);
  });

  /* ----- Delegated listener for .ebels-card-wishlist buttons -----
     Used by card-product.liquid (collection grid, etc.) and 404 Picks —
     these don't need their own dedicated JS file, this one listener
     covers all of them site-wide, present or future. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.ebels-card-wishlist');
    if (!btn) return;

    var pressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!pressed));
    btn.classList.toggle('is-active', !pressed);

    document.dispatchEvent(new CustomEvent('ebels:wishlist-toggle', {
      bubbles: true,
      detail: { handle: btn.getAttribute('data-product-handle'), added: !pressed }
    }));
  });

  /* ----- The actual Wishlist page -----
     Live-fetches each saved product via Shopify's real /products/{handle}.js
     endpoint — same technique Recently Viewed already uses. */
  function initWishlistPage() {
    var root = document.querySelector('[data-wishlist-page]');
    if (!root) return;

    var grid = root.querySelector('[data-wishlist-grid]');
    var emptyState = root.querySelector('[data-wishlist-empty]');
    var countEl = root.querySelector('[data-wishlist-page-count]');
    var shareBtn = root.querySelector('[data-wishlist-share]');

    render();

    document.addEventListener('ebels:wishlist-updated', render);

    function render() {
      var items = getWishlist();

      if (countEl) countEl.textContent = items.length;

      if (!items.length) {
        if (grid) grid.innerHTML = '';
        if (emptyState) emptyState.hidden = false;
        return;
      }

      if (emptyState) emptyState.hidden = true;
      if (!grid) return;

      grid.innerHTML = '';
      items.forEach(function (item) {
        fetch('/products/' + item.handle + '.js')
          .then(function (res) {
            if (!res.ok) throw new Error('not found');
            return res.json();
          })
          .then(function (product) { renderCard(product); })
          .catch(function () {
            // Product deleted/unpublished since being wishlisted — quietly drop it
            removeFromWishlist(item.handle);
          });
      });
    }

    function renderCard(product) {
      var variant = product.variants && product.variants[0];
      var image = product.featured_image || (product.images && product.images[0]) || '';
      var price = variant ? formatMoney(variant.price) : '';

      var card = document.createElement('div');
      card.className = 'ebels-wl__card';
      card.innerHTML = ''
        + '<button type="button" class="ebels-wl__remove" data-wishlist-remove="' + product.handle + '" aria-label="Remove from wishlist">'
        +   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        + '</button>'
        + '<a href="' + product.url + '" class="ebels-wl__media-link">'
        +   '<div class="ebels-wl__media">'
        +     (image ? '<img src="' + image + '" alt="' + escapeHtml(product.title) + '" class="ebels-wl__img" loading="lazy">' : '')
        +   '</div>'
        + '</a>'
        + '<p class="ebels-wl__vendor">' + escapeHtml(product.vendor || '') + '</p>'
        + '<a href="' + product.url + '" class="ebels-wl__title-link"><h3 class="ebels-wl__title">' + escapeHtml(product.title) + '</h3></a>'
        + '<p class="ebels-wl__price">' + price + '</p>';

      grid.appendChild(card);
    }

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-wishlist-remove]');
      if (!btn) return;
      removeFromWishlist(btn.getAttribute('data-wishlist-remove'));
    });

    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var url = window.location.href;
        if (navigator.share) {
          navigator.share({ title: 'My EBELS Wishlist', url: url }).catch(function () {});
        } else {
          navigator.clipboard.writeText(url).then(function () {
            var original = shareBtn.textContent;
            shareBtn.textContent = 'Link Copied!';
            setTimeout(function () { shareBtn.textContent = original; }, 1800);
          });
        }
      });
    }

    function formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str || '';
      return div.innerHTML;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    syncButtonsOnLoad();
    initWishlistPage();
  });
})();
