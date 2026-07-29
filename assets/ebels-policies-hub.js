document.addEventListener('DOMContentLoaded', function () {
  var tabs = document.querySelectorAll('[data-policy-tab]');
  var panels = document.querySelectorAll('[data-policy-panel]');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-policy-tab');

      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');

      panels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-policy-panel') === target);
      });
    });
  });
});
