document.addEventListener('DOMContentLoaded', function () {
  var searchInput = document.querySelector('[data-faq-search]');
  var pills = document.querySelectorAll('[data-faq-pill]');
  var groups = document.querySelectorAll('.ebels-faq-accordion__group');
  var items = document.querySelectorAll('.ebels-faq-item');
  var emptyState = document.querySelector('[data-faq-empty]');

  function setActivePill(pill) {
    pills.forEach(function (p) { p.classList.remove('is-active'); });
    if (pill) pill.classList.add('is-active');
  }

  function filterByCategory(category) {
    var anyVisible = false;
    groups.forEach(function (group) {
      var match = category === 'all' || group.dataset.category === category;
      group.hidden = !match;
      if (match) anyVisible = true;
    });
    if (emptyState) emptyState.hidden = anyVisible;
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var category = pill.dataset.faqPill;
      setActivePill(pill);
      filterByCategory(category);
      if (searchInput) searchInput.value = '';

      // Premium touch: smooth-scroll to the matching category heading
      // rather than just filtering in place, so the click feels like
      // it actually took you somewhere.
      if (category !== 'all') {
        var target = document.querySelector('.ebels-faq-accordion__group[data-category="' + category + '"]');
        if (target) {
          var offset = 100; // clears the sticky header
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();

      if (!query) {
        groups.forEach(function (g) { g.hidden = false; });
        items.forEach(function (i) { i.hidden = false; });
        if (emptyState) emptyState.hidden = true;
        setActivePill(document.querySelector('[data-faq-pill="all"]'));
        return;
      }

      var anyVisible = false;
      groups.forEach(function (group) { group.hidden = false; });

      items.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var match = text.indexOf(query) !== -1;
        item.hidden = !match;
        if (match) anyVisible = true;
      });

      groups.forEach(function (group) {
        var visibleItems = group.querySelectorAll('.ebels-faq-item:not([hidden])');
        group.hidden = visibleItems.length === 0;
      });

      if (emptyState) emptyState.hidden = anyVisible;
    });
  }
});
