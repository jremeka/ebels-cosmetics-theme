/* ==========================================================================
   EBELS COLLECTION HEADER — Read more toggle
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-collection-header]').forEach(function (root) {
    var btn = root.querySelector('[data-read-more-toggle]');
    var content = root.querySelector('[data-read-more-content]');
    if (!btn || !content) return;

    btn.addEventListener('click', function () {
      var isOpen = !content.hidden;
      content.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
      btn.textContent = isOpen ? 'Read more' : 'Show less';
    });
  });
})();
