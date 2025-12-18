(function () {
  // Expose API base (if other scripts set window.API_BASE, prefer it)
  const API_BASE = window.API_BASE || '/api';
  // When products are loaded, we'll set window.PRODUCTS and dispatch 'products:loaded'
  async function loadProducts() {
    // Try the API first
    try {
      const res = await fetch(API_BASE + '/products');
      if (!res.ok) throw new Error('API responded with status ' + res.status);
      const json = await res.json();
      // The API returns { success, count, data }
      const items = Array.isArray(json.data) ? json.data : [];
      // Map to the simpler shape some pages expect (similar to assets/data/products.json)
      const mapped = items.map(p => {
        // category may be an object (populated) or an id/slug; handle both
        const category = (p.category && (p.category.name || p.category)) || '';
        // price might be number — convert to display string with comma separators
        const priceStr = (typeof p.price === 'number') ? p.price.toLocaleString() : String(p.price || '');
        return {
          id: p._id,
          name: p.name,
          displayName: p.displayName || p.name,
          category: typeof category === 'string' ? category.toLowerCase() : (category.name || ''),
          price: priceStr,
          theme: p.theme || '',
          image: p.image || (p.images && p.images[0]) || 'images/placeholder.jpg',
          description: p.description || '',
          detailsPage: 'product-details.html?id=' + p._id // adjust if your details page uses a different query param
        };
      });

      window.PRODUCTS = mapped;
      // notify other scripts
      window.dispatchEvent(new CustomEvent('products:loaded', { detail: { source: 'api', products: mapped } }));
      return;
    } catch (err) {
      // API failed — fall back to static JSON
      console.warn('Products API failed, falling back to static JSON:', err.message);
    }

    // Fallback: load local static JSON
    try {
      const res2 = await fetch('assets/data/products.json');
      if (!res2.ok) throw new Error('Static JSON fetch failed: ' + res2.status);
      const j2 = await res2.json();
      // original static file has { products: [...] }
      const staticProducts = Array.isArray(j2.products) ? j2.products : [];
      // If static JSON already in desired shape, use directly
      window.PRODUCTS = staticProducts;
      window.dispatchEvent(new CustomEvent('products:loaded', { detail: { source: 'static', products: staticProducts } }));
    } catch (err) {
      console.error('Failed to load fallback static products.json:', err.message);
      window.PRODUCTS = [];
      window.dispatchEvent(new CustomEvent('products:loaded', { detail: { source: 'error', products: [] } }));
    }
  }

  // Run immediately
  loadProducts();

  // Provide a helper for pages that want a Promise instead of listening to events
  window.getProducts = function () {
    return new Promise((resolve) => {
      if (window.PRODUCTS) return resolve(window.PRODUCTS);
      function handler(e) {
        window.removeEventListener('products:loaded', handler);
        resolve(e.detail.products || []);
      }
      window.addEventListener('products:loaded', handler);
    });
  };
})();