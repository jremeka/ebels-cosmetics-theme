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
