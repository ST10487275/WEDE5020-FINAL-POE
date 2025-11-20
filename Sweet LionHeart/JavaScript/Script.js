function getCart() {
  const stored = localStorage.getItem('cartItems');
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem('cartItems', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const countSpan = document.getElementById('cart-count');
  if (!countSpan) return;
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  countSpan.textContent = totalItems;
}

function getUsers() {
  const stored = localStorage.getItem('users');
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

function setCurrentUser(username) {
  localStorage.setItem('currentUser', username);
}

function logoutUser() {
  localStorage.removeItem('currentUser');
}

function initShopPage() {
  const cards = document.querySelectorAll('.shop-grid .card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const name = card.querySelector('h3').textContent;
      const priceText = card.querySelectorAll('p')[1].textContent;
      const img = card.querySelector('img').src;

      const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

      const params = new URLSearchParams();
      params.set('name', name);
      params.set('price', price.toString());
      params.set('image', img);

      window.location.href = 'Order.html?' + params.toString();
    });
  });
}

function initOrderPage() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  const basePrice = parseFloat(params.get('price'));
  const image = params.get('image');

  document.getElementById('product-name').textContent = name;
  document.getElementById('base-price').textContent = 'R' + basePrice.toFixed(2);
  document.getElementById('product-image').src = image;

  const sizeSelect = document.getElementById('size-select');
  const flavourSelect = document.getElementById('flavour-select');
  const quantityInput = document.getElementById('quantity-input');

  function calc() {
    const size = sizeSelect.value;
    const extra = parseFloat(flavourSelect.options[flavourSelect.selectedIndex].dataset.extra) || 0;
    const quantity = parseInt(quantityInput.value) || 1;

    let mult = 1;
    if (size === 'small') mult = 0.8;
    if (size === 'large') mult = 1.35;

    const pricePerItem = basePrice * mult + extra;
    const total = pricePerItem * quantity;

    document.getElementById('price-per-item').textContent = 'R' + pricePerItem.toFixed(2);
    document.getElementById('final-price').textContent = 'R' + total.toFixed(2);

    return { pricePerItem, total, quantity, size };
  }

  calc();
  sizeSelect.onchange = calc;
  flavourSelect.onchange = calc;
  quantityInput.oninput = calc;

  document.getElementById('add-to-cart-btn').onclick = () => {
    const data = calc();
    const flavour = flavourSelect.options[flavourSelect.selectedIndex].textContent;
    const notes = document.getElementById('special-instructions').value;

    const cart = getCart();
    cart.push({
      id: Date.now().toString(),
      name,
      image,
      basePrice,
      size: data.size,
      flavour,
      quantity: data.quantity,
      pricePerItem: data.pricePerItem,
      totalPrice: data.total,
      notes
    });

    saveCart(cart);
    updateCartCount();
    alert('Item added to cart!');
  };
}

function initCartPage() {
  const body = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const empty = document.getElementById('empty-cart-message');
  const table = document.getElementById('cart-content');
  const clearBtn = document.getElementById('clear-cart-btn');

  function render() {
    const cart = getCart();
    body.innerHTML = '';

    if (!cart.length) {
      empty.style.display = 'block';
      table.style.display = 'none';
      totalEl.textContent = 'R0.00';
      return;
    }

    empty.style.display = 'none';
    table.style.display = 'block';

    let total = 0;

    cart.forEach(item => {
      const tr = document.createElement('tr');

      const imgCell = document.createElement('td');
      imgCell.innerHTML = `<img src="${item.image}" width="80" height="60"><br>${item.name}`;

      const detailsCell = document.createElement('td');
      detailsCell.innerHTML = `Size: ${item.size}<br>Flavour: ${item.flavour}<br>${item.notes ? 'Notes: ' + item.notes : ''}`;

      const qtyCell = document.createElement('td');
      qtyCell.textContent = item.quantity;

      const priceCell = document.createElement('td');
      priceCell.textContent = 'R' + item.pricePerItem.toFixed(2);

      const totCell = document.createElement('td');
      totCell.textContent = 'R' + item.totalPrice.toFixed(2);

      const removeCell = document.createElement('td');
      const btn = document.createElement('button');
      btn.textContent = 'X';
      btn.onclick = () => {
        const updated = getCart().filter(c => c.id !== item.id);
        saveCart(updated);
        updateCartCount();
        render();
      };
      removeCell.appendChild(btn);

      tr.append(imgCell, detailsCell, qtyCell, priceCell, totCell, removeCell);
      body.appendChild(tr);

      total += item.totalPrice;
    });

    totalEl.textContent = 'R' + total.toFixed(2);
  }

  clearBtn.onclick = () => {
    saveCart([]);
    updateCartCount();
    render();
  };

  render();
}

function initRegisterPage() {
  const form = document.getElementById('register-form');

  form.onsubmit = e => {
    e.preventDefault();

    const users = getUsers();
    users.push({
      username: document.getElementById('reg-username').value,
      password: document.getElementById('reg-password').value,
      contact: document.getElementById('reg-contact').value
    });

    saveUsers(users);
    alert('Account created!');
    window.location.href = 'Login.html';
  };
}

function initLoginPage() {
  const form = document.getElementById('login-form');

  form.onsubmit = e => {
    e.preventDefault();

    const users = getUsers();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const found = users.find(u => u.username === username && u.password === password);

    if (!found) {
      alert('Invalid login');
      return;
    }

    setCurrentUser(found.username);
    alert('Welcome ' + found.username);
    window.location.href = 'Shop.html';
  };
}

function initAccountPage() {
  const current = getCurrentUser();
  if (!current) {
    window.location.href = 'Login.html';
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.username === current);

  document.getElementById('acc-username').textContent = user.username;
  document.getElementById('acc-contact').textContent = user.contact;

  document.getElementById('logout-btn').onclick = () => {
    logoutUser();
    window.location.href = 'SweetLionHeart.html';
  };

  document.getElementById('edit-btn').onclick = () => {
    document.getElementById('edit-section').style.display = 'block';
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-contact').value = user.contact;
  };

  document.getElementById('save-edit-btn').onclick = () => {
    const newUser = document.getElementById('edit-username').value;
    const newContact = document.getElementById('edit-contact').value;
    const newPass = document.getElementById('edit-password').value;

    const updated = users.map(u =>
      u.username === current
        ? {
            username: newUser,
            contact: newContact,
            password: newPass ? newPass : u.password
          }
        : u
    );

    saveUsers(updated);
    setCurrentUser(newUser);
    alert('Account updated!');
    window.location.reload();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  const body = document.body;

  if (body.classList.contains('shop-page')) initShopPage();
  if (body.classList.contains('order-page')) initOrderPage();
  if (body.classList.contains('cart-page')) initCartPage();
  if (body.classList.contains('register-page')) initRegisterPage();
  if (body.classList.contains('login-page')) initLoginPage();
  if (body.classList.contains('account-page')) initAccountPage();

  const news = document.getElementById('newsletter-form');
  if (news) {
    news.onsubmit = e => {
      e.preventDefault();
      alert('Thank you for subscribing!');
    };
  }

  const contact = document.getElementById('contact-form');
  if (contact) {
    contact.onsubmit = e => {
      e.preventDefault();
      alert('Thank you for reaching out!');
    };
  }
});
