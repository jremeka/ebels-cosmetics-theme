/* ==========================================================================
   EBELS REAL PEOPLE, REAL LOOKS — interactions
   ========================================================================== */

(function () {
  'use strict';

  document.querySelectorAll('[data-real-looks-section]').forEach(initRealLooks);

  function initRealLooks(root) {
    initVideos(root);
    initCopyHashtag(root);
  }

  /* ----- Video: all autoplay muted, unmuting one mutes the rest ----- */
  function initVideos(root) {
    var cards = root.querySelectorAll('.ebels-rl__card');

    cards.forEach(function (card) {
      var video = card.querySelector('video');
      if (!video) return;

      var playBtn = card.querySelector('.ebels-rl__play');
      var muteBtn = card.querySelector('.ebels-rl__mute');

      video.muted = true;
      attemptPlay(video, card);

      if (muteBtn) {
        muteBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var willUnmute = video.muted;

          if (willUnmute) {
            // Unmuting this one — mute every other video so only one is audible at a time
            cards.forEach(function (otherCard) {
              if (otherCard === card) return;
              var otherVideo = otherCard.querySelector('video');
              var otherMuteBtn = otherCard.querySelector('.ebels-rl__mute');
              if (otherVideo) {
                otherVideo.muted = true;
                if (otherMuteBtn) {
                  otherMuteBtn.classList.remove('is-unmuted');
                  otherMuteBtn.setAttribute('aria-label', 'Unmute video');
                }
              }
            });
          }

          video.muted = !willUnmute;
          muteBtn.classList.toggle('is-unmuted', willUnmute);
          muteBtn.setAttribute('aria-label', willUnmute ? 'Mute video' : 'Unmute video');
        });
      }

      if (playBtn) {
        playBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          togglePlay(video, card);
        });
      }
    });

    function togglePlay(video, card) {
      if (video.paused) {
        card.removeAttribute('data-user-paused');
        attemptPlay(video, card);
      } else {
        video.pause();
        card.classList.remove('is-playing');
        card.setAttribute('data-user-paused', 'true');
      }
    }

    function attemptPlay(video, card) {
      var playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(function () { card.classList.add('is-playing'); })
          .catch(function () {
            // Autoplay blocked by the browser — card just shows the paused state,
            // the user can still hit play manually.
          });
      } else {
        card.classList.add('is-playing');
      }
    }

    // Pause videos scrolled out of view, resume when back in view —
    // unless the person manually paused that specific card.
    if ('IntersectionObserver' in window) {
      var viewObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var card = entry.target;
          var video = card.querySelector('video');
          if (!video) return;

          if (entry.isIntersecting) {
            if (card.getAttribute('data-user-paused') !== 'true') {
              attemptPlay(video, card);
            }
          } else if (!video.paused) {
            video.pause();
            card.classList.remove('is-playing');
          }
        });
      }, { threshold: 0.2 });

      cards.forEach(function (card) { viewObserver.observe(card); });
    }
  }

  /* ----- Copy hashtag button ----- */
  function initCopyHashtag(root) {
    var btn = root.querySelector('[data-copy-hashtag]');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var hashtag = btn.getAttribute('data-copy-hashtag');
      var label = btn.querySelector('[data-copy-label]');
      var originalText = label ? label.textContent : '';

      function showCopied() {
        btn.classList.add('is-copied');
        if (label) label.textContent = 'Copied!';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          if (label) label.textContent = originalText;
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hashtag).then(showCopied).catch(function () {
          fallbackCopy(hashtag, showCopied);
        });
      } else {
        fallbackCopy(hashtag, showCopied);
      }
    });

    function fallbackCopy(text, onSuccess) {
      var temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand('copy');
        onSuccess();
      } catch (e) {
        // Clipboard unavailable — fail silently, button just won't confirm
      }
      document.body.removeChild(temp);
    }
  }
})();
