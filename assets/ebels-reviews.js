/* ==========================================================================
   EBELS REVIEWS — interactions
   Both handlers below are STUBS: they update the UI locally and fire a
   custom event, but nothing persists to a server yet. Wire real logic to
   these events when a review app or backend is connected.
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-reviews-section]').forEach(initReviews);

  function initReviews(root) {
    initWriteReview(root);
    initHelpful(root);
  }

  /* ----- Write a Review (stub) ----- */
  function initWriteReview(root) {
    var btn = root.querySelector('[data-write-review]');
    if (!btn) return;

    btn.addEventListener('click', function () {
      // Hook a real review-form modal/app to this event later.
      root.dispatchEvent(new CustomEvent('ebels:write-review', {
        bubbles: true,
        detail: { productId: document.querySelector('[data-product-section]')?.getAttribute('data-product-id') || null }
      }));
    });
  }

  /* ----- Helpful counter (local-only stub) ----- */
  function initHelpful(root) {
    var buttons = root.querySelectorAll('[data-helpful-toggle]');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('is-voted')) return;

        var countEl = btn.querySelector('[data-helpful-count]');
        var current = parseInt(btn.getAttribute('data-count'), 10) || 0;
        var updated = current + 1;

        btn.setAttribute('data-count', updated);
        if (countEl) countEl.textContent = updated;
        btn.classList.add('is-voted');

        var card = btn.closest('[data-review-id]');
        // Hook real vote persistence (API call) to this event later.
        root.dispatchEvent(new CustomEvent('ebels:review-helpful', {
          bubbles: true,
          detail: { reviewId: card ? card.getAttribute('data-review-id') : null, count: updated }
        }));
      });
    });
  }
})();
