/* ==========================================================================
   EBELS PRODUCT TABS — switching logic
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-tabs-section]').forEach(initTabs);

  function initTabs(root) {
    var triggers = root.querySelectorAll('[data-tab-trigger]');
    var panels = root.querySelectorAll('[data-tab-panel]');
    if (!triggers.length) return;

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        activateTab(trigger.getAttribute('data-tab-index'));
      });

      // Keyboard: left/right arrows move between tabs, matching standard tab UI behavior
      trigger.addEventListener('keydown', function (e) {
        var currentIndex = Array.prototype.indexOf.call(triggers, trigger);
        var nextIndex = null;

        if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % triggers.length;
        if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;

        if (nextIndex !== null) {
          e.preventDefault();
          triggers[nextIndex].focus();
          activateTab(triggers[nextIndex].getAttribute('data-tab-index'));
        }
      });
    });

    function activateTab(index) {
      triggers.forEach(function (t) {
        var isMatch = t.getAttribute('data-tab-index') === index;
        t.classList.toggle('is-active', isMatch);
        t.setAttribute('aria-selected', String(isMatch));
      });
      panels.forEach(function (p) {
        var isMatch = p.getAttribute('data-tab-index') === index;
        p.hidden = !isMatch;
        p.classList.toggle('is-active', isMatch);
      });
    }
  }
})();
