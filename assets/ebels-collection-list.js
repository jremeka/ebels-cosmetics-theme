/* ==========================================================================
   EBELS COLLECTION LIST — scroll arrows, edge fade, drag-to-scroll
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-collection-list-section]').forEach(initSection);

  function initSection(root) {
    var track = root.querySelector('[data-cl-track]');
    var prevBtn = root.querySelector('[data-cl-prev]');
    var nextBtn = root.querySelector('[data-cl-next]');
    var fadeLeft = root.querySelector('[data-cl-fade-left]');
    var fadeRight = root.querySelector('[data-cl-fade-right]');
    if (!track) return;

    var scrollAmount = function () {
      var item = track.querySelector('.ebels-cl__item');
      var itemWidth = item ? item.getBoundingClientRect().width : 150;
      return itemWidth * 3; // scroll roughly 3 items per arrow click
    };

    function updateEdges() {
      var atStart = track.scrollLeft <= 4;
      var atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;

      if (prevBtn) prevBtn.disabled = atStart;
      if (nextBtn) nextBtn.disabled = atEnd;
      if (fadeLeft) fadeLeft.classList.toggle('is-hidden', atStart);
      if (fadeRight) fadeRight.classList.toggle('is-hidden', atEnd);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
      });
    }

    track.addEventListener('scroll', debounce(updateEdges, 50));
    window.addEventListener('resize', debounce(updateEdges, 150));
    updateEdges();

    /* ----- Mouse drag-to-scroll (desktop only, touch already scrolls natively) ----- */
    var isDragging = false;
    var startX = 0;
    var startScroll = 0;
    var moved = false;

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // let native touch scrolling handle mobile
      isDragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
    });

    track.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      var delta = e.clientX - startX;
      if (Math.abs(delta) > 4) moved = true;
      track.scrollLeft = startScroll - delta;
    });

    function endDrag() {
      isDragging = false;
      track.classList.remove('is-dragging');
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointerleave', endDrag);

    // Prevent the drag gesture from also triggering a click-through to the collection page
    track.addEventListener('click', function (e) {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);

    /* ----- Keyboard: left/right arrows scroll when the track is focused ----- */
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
      }
    });
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }
})();
