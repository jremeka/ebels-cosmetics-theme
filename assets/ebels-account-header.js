/* ==========================================================================
   EBELS ACCOUNT HEADER — tab switching
   Each tab panel lives in its OWN section (data-account-tab-panel="foryou"
   etc.), not nested inside this header section, since they're separate
   Liquid sections on the page. This script toggles them all together.

   FIX: previously fell back to whatever the URL hash literally was, with
   no validation. Classic Shopify forms (like the customer/address forms
   used on this page) redirect back with #contact_form on success — that
   matched no real tab, so every panel ended up hidden at once. Now it
   only trusts the hash if it's an actual known tab name.
   ========================================================================== */

(function () {
  'use strict';

  var triggers = document.querySelectorAll('[data-account-tab-trigger]');
  var panels = document.querySelectorAll('[data-account-tab-panel]');
  if (!triggers.length) return;

  var validTabs = Array.prototype.map.call(triggers, function (t) {
    return t.getAttribute('data-tab-target');
  });

  var hashTab = window.location.hash.replace('#', '');
  var initialTab = validTabs.indexOf(hashTab) !== -1 ? hashTab : 'profile';

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
