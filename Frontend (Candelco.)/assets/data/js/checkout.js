// assets/js/checkout.js
// Checkout: reads cart from localStorage, shows items, posts order to /api/orders with Authorization Bearer token.

(function () {
  const cartKey = 'cart';
  const SHIPPING_DEFAULT = 250;

  function formatPKR(n) {
    return 'PKR ' + Number(n || 0).toLocaleString();
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(cartKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function renderCart() {
    const items = loadCart();
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    if (!items.length) {
      container.innerHTML = '<div class="text-gray-500">Your cart is empty.</div>';
      document.getElementById('subtotalDisplay').textContent = formatPKR(0);
      return;
    }

    let subtotal = 0;
    items.forEach(it => {
      const price = parseInt((it.price || '0').toString().replace(/\D/g, '')) || 0;
      const itemSubtotal = price * (Number(it.qty) || 1);
      subtotal += itemSubtotal;

      const row = document.createElement('div');
      row.className = 'flex items-center justify-between';
      row.innerHTML = `
        <div class="flex items-center space-x-4">
          <img src="${it.image || 'images/placeholder.jpg'}" class="w-16 h-16 object-cover rounded" />
          <div>
            <div class="font-semibold">${it.name}</div>
            <div class="text-sm text-gray-600">Type: ${it.type || it.size || '-' } | Theme: ${it.theme || '-'}</div>
            <div class="text-sm text-gray-600">Qty: ${it.qty}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-semibold">${formatPKR(itemSubtotal)}</div>
        </div>
      `;
      container.appendChild(row);
    });

    const total = subtotal + SHIPPING_DEFAULT;
    
    document.getElementById('subtotalDisplay').textContent = formatPKR(subtotal);
    document.getElementById('shippingCostDisplay').textContent = formatPKR(SHIPPING_DEFAULT);
    document.getElementById('totalDisplay').textContent = formatPKR(total);
    // store computed subtotal for use on submit
    container.dataset.subtotal = subtotal;
  }

  async function submitOrder(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in before placing an order.');
      window.location.href = 'login.html';
      return;
    }

    const cart = loadCart();
    if (!cart.length) {
      alert('Your cart is empty.');
      return;
    }

    // gather form values
    const customerName = document.getElementById('cust-name').value.trim();
    const customerEmail = document.getElementById('cust-email').value.trim();
    const customerPhone = document.getElementById('cust-phone').value.trim();
    const street = document.getElementById('addr-street').value.trim();
    const city = document.getElementById('addr-city').value.trim();
    const postalCode = document.getElementById('addr-postal').value.trim();
    const country = document.getElementById('addr-country').value.trim() || 'Pakistan';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Cash on Delivery';
    const notes = document.getElementById('notes').value.trim();

    if (!customerName || !customerEmail || !customerPhone || !street || !city || !postalCode) {
      alert('Please fill all required shipping and contact fields.');
      return;
    }

    // build items payload using productId from cart items (id)
    const items = cart.map(ci => ({
      productId: ci.id || ci.productId || ci._id, // support different keys
      quantity: Number(ci.qty) || 1,
      size: ci.size || '',
      theme: ci.theme || ''
      // price is not trusted; server will compute using product.price
    }));

    const subtotal = Number(document.getElementById('cartItems').dataset.subtotal || 0);
    const shippingCost = SHIPPING_DEFAULT;
    const total = subtotal + shippingCost;

    const payload = {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: { street, city, postalCode, country },
      paymentMethod,
      notes,
      shippingCost
    };

    // disable button while sending
    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.textContent = 'Placing...';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || 'Failed to place order.');
        btn.disabled = false;
        btn.textContent = 'Place Order';
        return;
      }

      // success: clear cart and redirect to order success page
      localStorage.removeItem(cartKey);
      const orderNumber = json.data && json.data.orderNumber ? json.data.orderNumber : (json.data && json.data._id ? json.data._id : '');
      window.location.href = 'order-success.html?order=' + encodeURIComponent(orderNumber);
    } catch (err) {
      console.error('Checkout error', err);
      alert('Network or server error. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Place Order';
    }
  }

  document.getElementById('checkoutForm')?.addEventListener('submit', submitOrder);
  // render cart on load
  document.addEventListener('DOMContentLoaded', renderCart);
})();