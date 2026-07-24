/* ==========================================================================
   EBELS ACCOUNT HEADER — tab switching
   Each tab panel lives in its OWN section (data-account-tab-panel="foryou"
   etc.), not nested inside this header section, since they're separate
   Liquid sections on the page. This script toggles them all together.
   ========================================================================== */

(function () {
  'use strict';

  var triggers = document.querySelectorAll('[data-account-tab-trigger]');
  var panels = document.querySelectorAll('[data-account-tab-panel]');
  if (!triggers.length) return;

  // Restore last-viewed tab from the URL hash, if present (e.g. #orders)
  var initialTab = window.location.hash.replace('#', '') || 'profile';

  function activate(tabName) {
    triggers.forEach(function (t) {
      var isMatch = t.getAttribute('data-tab-target') === tabName;
      t.classList.toggle('is-active', isMatch);
      t.setAttribute('aria-selected', String(isMatch));
    });

    panels.forEach(function (p) {
      var isMatch = p.getAttribute('data-account-tab-panel') === tabName;
      p.hidden = !isMatch;
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var target = trigger.getAttribute('data-tab-target');
      activate(target);
      history.replaceState(null, '', '#' + target);
    });
  });

  activate(initialTab);
})();
