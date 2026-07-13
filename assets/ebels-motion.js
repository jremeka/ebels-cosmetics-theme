/* ==========================================================================
   EBELS MOTION
   Global scroll-reveal system. Elements fade and rise as they enter the
   viewport, with a soft stagger for grids. Self-contained: injects its own
   CSS, respects prefers-reduced-motion, and re-binds when sections are
   added or reloaded in the theme editor.
   ========================================================================== */

(function () {
  'use strict';

  // Elements that receive reveal animation automatically.
  // Add any future section's classes here, or put data-reveal on any element.
  var AUTO_TARGETS = [
    '.ebels-hero__content',
    '.ebels-bestsellers__header',
    '.ebels-bestsellers__card',
    '.ebels-catgrid__header',
    '.ebels-catgrid__pills',
    '.ebels-catgrid__card',
    '.ebels-ugc__header',
    '.ebels-ugc__card',
    '.ebels-promo__content',
    '.ebels-tiles__tile',
    '[data-reveal]'
  ].join(',');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Inject styles once -----
  function injectStyles() {
    if (document.getElementById('ebels-motion-styles')) return;
    var css = ''
      + '.ebels-reveal{opacity:0;transform:translateY(24px);'
      + 'transition:opacity .7s ease,transform .7s cubic-bezier(.22,.61,.36,1);'
      + 'transition-delay:var(--reveal-delay,0ms);will-change:opacity,transform;}'
      + '.ebels-reveal.is-revealed{opacity:1;transform:none;}'
      + '@media (prefers-reduced-motion:reduce){'
      + '.ebels-reveal{opacity:1;transform:none;transition:none;}}';
    var style = document.createElement('style');
    style.id = 'ebels-motion-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ----- Observer -----
  var observer = null;

  function getObserver() {
    if (observer) return observer;
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    return observer;
  }

  // ----- Bind targets -----
  function bind(scope) {
    if (reducedMotion) return;
    var root = scope || document;
    var targets = root.querySelectorAll(AUTO_TARGETS);

    // Group siblings so grids stagger naturally
    var groups = new Map();
    targets.forEach(function (el) {
      if (el.classList.contains('ebels-reveal')) return;
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    groups.forEach(function (els) {
      els.forEach(function (el, i) {
        el.classList.add('ebels-reveal');
        el.style.setProperty('--reveal-delay', Math.min(i * 90, 450) + 'ms');
        getObserver().observe(el);
      });
    });
  }

  // ----- Init -----
  function init() {
    injectStyles();
    bind(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-bind when sections load in the theme editor
  document.addEventListener('shopify:section:load', function (event) {
    bind(event.target);
  });
})();
