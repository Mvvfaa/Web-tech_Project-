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
  
  // Fallback: if image fails to load from /images, try /uploads
  imgEl.onerror = function() {
    if (!this.src.includes('/uploads/')) {
      const filename = img.includes('/') ? img.split('/').pop() : img;
      this.onerror = null; // Prevent infinite loop
      this.src = 'uploads/' + filename;
    }
  };
})();