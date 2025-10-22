(function () {
  const imgEl = document.getElementById('product-image');
  if (!imgEl) return;
  const params = new URLSearchParams(window.location.search);
  const img = params.get('img');
  if (!img) return;
  // allow only simple filenames and common image extensions
  const ok = /^[\w\-\.\s]+\.(jpe?g|png|webp|gif)$/i;
  if (!ok.test(img)) return;
  const safeSrc = img.includes('/') ? img : ('images/' + img);
  imgEl.src = safeSrc;
  imgEl.alt = img.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
})();