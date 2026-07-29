/* ==========================================================================
   EBELS SEARCH HEADER — sort dropdown toggle
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-search-sort-dropdown]').forEach(function (wrap) {
    var trigger = wrap.querySelector('[data-search-sort-trigger]');
    var menu = wrap.querySelector('[data-search-sort-menu]');
    if (!trigger || !menu) return;

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
  });
})();
