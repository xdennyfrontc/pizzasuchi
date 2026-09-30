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
  let id = Number(document.getElementById('pId').value);

  if (id === 0) {
    // ID не указан: ставим в конец списка
    id = Math.max(0, ...products.map(p => p.id)) + 1;
  } else if (id < 1 || !Number.isInteger(id)) {
    alert('ID должен быть целым числом от 1');
    return;
  } else if (products.some(p => p.id === id)) {
    // ID занят: предлагаем сдвинуть товары с этим и большими ID на одну позицию вниз
    if (!confirm('ID ' + id + ' уже занят. Сдвинуть товары с ID ' + id + ' и больше на одну позицию вниз?')) return;
    products.forEach(p => { if (p.id >= id) p.id++; });

    // Корзина хранит товары по ID, поэтому сдвигаем ID и в ней
    const cart = DB.get('cart', []);
    cart.forEach(c => { if (c.id >= id) c.id++; });
    DB.set('cart', cart);
  }

  products.push({
    id: id, name: name, price: price, oldPrice: oldPrice,
    image: document.getElementById('pImage').value.trim(),
    desc: document.getElementById('pDesc').value,
    category: document.getElementById('pCat').value
  });
  saveProducts(products);
  renderProducts();
}

// Стопка удалённых товаров: последний удалённый лежит в конце
let deletedStack = [];

function deleteProduct(id) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);

  // Запоминаем товар и его место в списке, потом удаляем
  deletedStack.push({ product: products[index], index: index });
  saveProducts(products.filter(p => p.id !== id));

  renderProducts();
  renderUndo();
}

function undoDelete() {
  const last = deletedStack.pop();        // берём последнее удаление
  if (!last) return;

  const products = getProducts();
  // Если за это время добавили товар с таким же id, выдаём возвращаемому новый
  if (products.some(p => p.id === last.product.id)) {
    last.product.id = Math.max(...products.map(p => p.id)) + 1;
  }
  products.splice(last.index, 0, last.product);   // вставляем на прежнее место
  saveProducts(products);

  renderProducts();
  renderUndo();
}

// Показать или скрыть плашку
function renderUndo() {
  const bar = document.getElementById('undoBar');
  if (deletedStack.length === 0) { bar.style.display = 'none'; return; }
  const last = deletedStack[deletedStack.length - 1].product;
  document.getElementById('undoText').textContent = 'Удалено: «' + last.name + '»';
  bar.style.display = 'flex';
}

// Ctrl+Z (Cmd+Z на Mac) тоже отменяет удаление, но не в полях ввода
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && e.target.tagName !== 'INPUT') {
    undoDelete();
  }
});

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