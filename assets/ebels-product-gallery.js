/* Expands a capped product-gallery thumbnail strip when its "+X"
   button is clicked. Uses event delegation on document so it works
   for every product media gallery on the page without needing
   per-instance setup, including after a Shopify section reload. */
document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-ebels-thumb-more]');
  if (!btn) return;
  e.preventDefault();
  var list = btn.closest('.thumbnail-list');
  if (list) {
    list.classList.add('ebels-thumbs-expanded');
  }
});
