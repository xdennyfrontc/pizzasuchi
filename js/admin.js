/* ===== Админ-панель ===== */

// Защита: пускаем только пользователя с ролью admin
const currentUser = getCurrentUser();
if (!currentUser || currentUser.role !== 'admin') {
  alert('Доступ только для администратора');
  window.location.href = 'index.html';
}

// Список категорий для формы берём из storage.js
document.getElementById('pCat').innerHTML = CATEGORIES.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('');

function categoryName(id) {
  const c = CATEGORIES.find(x => x.id === id);
  return c ? c.name : id;
}

function renderProducts() {
  let html = '<tr><th>ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>Старая цена</th><th></th></tr>';
  getProducts().forEach(p => {
    html += '<tr><td>' + p.id + '</td><td>' + p.name + '</td><td>' + categoryName(p.category) + '</td><td>' + p.price +
      ' ₽</td><td>' + (p.oldPrice ? p.oldPrice + ' ₽' : '—') +
      '</td><td><button class="btn" onclick="deleteProduct(' + p.id + ')">Удалить</button></td></tr>';
  });
  document.getElementById('productsTable').innerHTML = html;
}

function addProduct() {
  const name = document.getElementById('pName').value.trim();
  const price = Number(document.getElementById('pPrice').value);
  const oldPrice = Number(document.getElementById('pOld').value) || 0;
  if (name === '' || price <= 0) { alert('Введите название и цену'); return; }

  const products = getProducts();
  const newId = products.length ? products[products.length - 1].id + 1 : 1;
  products.push({
    id: newId, name: name, price: price, oldPrice: oldPrice, image: '',
    desc: document.getElementById('pDesc').value,
    category: document.getElementById('pCat').value
  });
  saveProducts(products);
  renderProducts();
}

function deleteProduct(id) {
  saveProducts(getProducts().filter(p => p.id !== id));
  renderProducts();
}

function renderUsers() {
  let html = '<tr><th>Имя</th><th>Email</th><th>Роль</th></tr>';
  getUsers().forEach(u => { html += '<tr><td>' + u.name + '</td><td>' + u.email + '</td><td>' + u.role + '</td></tr>'; });
  document.getElementById('usersTable').innerHTML = html;
}

function renderOrders() {
  let html = '<tr><th>№</th><th>Клиент</th><th>Состав</th><th>Получение</th><th>Время</th><th>Сумма</th><th>Дата</th></tr>';
  getOrders().forEach(o => {
    html += '<tr><td>' + o.id + '</td><td>' + o.email + '</td><td>' + o.items + '</td><td>' + o.type +
      '</td><td>' + o.time + '</td><td>' + o.total + ' ₽</td><td>' + o.date + '</td></tr>';
  });
  document.getElementById('ordersTable').innerHTML = html;
}

renderProducts();
renderUsers();
renderOrders();