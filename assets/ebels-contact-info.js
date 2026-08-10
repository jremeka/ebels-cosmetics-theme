document.addEventListener('DOMContentLoaded', function () {
  var carousel = document.querySelector('[data-address-carousel]');
  if (!carousel) return;

  var slides = carousel.querySelectorAll('.ebels-contact-info__address-slide');
  var dots = carousel.querySelectorAll('.ebels-contact-info__address-dot');
  var prevBtn = carousel.querySelector('[data-address-prev]');
  var nextBtn = carousel.querySelector('[data-address-next]');
  var current = 0;

  function show(index) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
    current = index;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      show((current - 1 + slides.length) % slides.length);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      show((current + 1) % slides.length);
    });
  }
});

/* ----- Copy button (e.g. phone number cards) ----- */
document.addEventListener('DOMContentLoaded', function () {
  var buttons = document.querySelectorAll('[data-copy-value]');
  if (!buttons.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy-value');
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
        navigator.clipboard.writeText(value).then(showCopied).catch(function () {
          fallbackCopy(value, showCopied);
        });
      } else {
        fallbackCopy(value, showCopied);
      }
    });
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
});
