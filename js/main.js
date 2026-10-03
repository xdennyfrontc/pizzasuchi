/* ===== Главная страница: меню, выгода, корзина, чек ===== */

let category = 'all';
let query = '';                       // текст из строки поиска
let mode = 'delivery';                // 'delivery' или 'pickup'
let cart = DB.get('cart', []);        // элемент корзины: { id, qty }

// ---------- Шапка ----------
function renderUser() {
  const user = getCurrentUser();
  const box = document.getElementById('userBox');
  if (!user) {
    box.innerHTML = '<button class="btn btn-main" onclick="openAuth()">Войти</button>';
    return;
  }
  let html = '<span>' + user.name + '</span>';
  if (user.role === 'admin') html += '<a class="btn" href="admin.html">Админ-панель</a>';
  html += '<button class="btn" onclick="logout()">Выйти</button>';
  box.innerHTML = html;
}

// ---------- Меню ----------
function renderTabs() {
  let html = '<button class="tab' + (category === 'all' ? ' active' : '') + '" onclick="setCategory(\'all\')">Всё</button>';
  CATEGORIES.forEach(c => {
    html += '<button class="tab' + (category === c.id ? ' active' : '') + '" onclick="setCategory(\'' + c.id + '\')">' + c.name + '</button>';
  });
  document.getElementById('tabs').innerHTML = html;
}

function setCategory(id) {
  category = id;
  query = '';                                        // выбор категории сбрасывает поиск
  document.getElementById('searchInput').value = '';
  renderTabs();
  renderMenu();
}

// Поиск по названию среди всех категорий
function searchMenu(text) {
  query = text.trim().toLowerCase();
  renderMenu();
}

function renderMenu() {
  let list = getProducts();
  if (query !== '') {
    list = list.filter(p => p.name.toLowerCase().includes(query));   // поиск игнорирует категорию
  } else if (category !== 'all') {
    list = list.filter(p => p.category === category);
  }
  document.getElementById('menuTitle').textContent = query !== '' ? 'Результаты поиска' : 'Меню';
  const empty = query !== '' ? 'Ничего не найдено' : 'В этой категории пока пусто';
  document.getElementById('menu').innerHTML = list.map(cardHtml).join('') || '<p class="desc">' + empty + '</p>';
}

// ---------- Блок «Выгода» ----------
function renderDeals() {
  document.getElementById('banner').textContent = '🚚 Бесплатная доставка при заказе от ' + FREE_DELIVERY_FROM + ' ₽';
  const deals = getProducts().filter(p => p.oldPrice > p.price);
  document.getElementById('deals').innerHTML = deals.map(cardHtml).join('');
}

// Сколько штук товара в корзине
function qtyOf(id) {
  const item = cart.find(c => c.id === id);
  return item ? item.qty : 0;
}

// Кнопка «+» или счётчик «− 1 +»: всегда строится заново из корзины
function ctrlHtml(id) {
  const qty = qtyOf(id);
  if (qty === 0) return '<button class="add" onclick="addToCart(' + id + ')">+</button>';
  return '<div class="qty">' +
    '<button class="qty-minus" onclick="changeQty(' + id + ',-1)">−</button>' +
    '<b class="qty-num">' + qty + '</b>' +
    '<button class="qty-plus" onclick="addToCart(' + id + ')">+</button></div>';
}

// Вызывается после любого изменения корзины: перерисовывает только те карточки, где число изменилось
function updateCtrls() {
  document.querySelectorAll('.ctrl').forEach(el => {
    const id = Number(el.dataset.id);
    const before = Number(el.dataset.qty);
    const now = qtyOf(id);
    if (before === now) return;

    el.innerHTML = ctrlHtml(id);
    el.dataset.qty = now;
    if (now > 0 && before === 0) el.firstElementChild.classList.add('pop');        // счётчик появился
    if (now > 0 && before > 0) el.querySelector('.qty-num').classList.add('bump'); // число изменилось
  });
}

function cardHtml(p) {
  let badge = '';
  let price = '<b>' + p.price + ' ₽</b>';
  if (p.oldPrice > p.price) {
    const percent = Math.round((p.oldPrice - p.price) / p.oldPrice * 100);
    badge = '<span class="badge">−' + percent + '%</span>';
    price = '<span><b class="green">' + p.price + ' ₽</b> <s class="old">' + p.oldPrice + ' ₽</s></span>';
  }
  const fit = p.fit ? ' class="' + p.fit + '"' : '';
  const picture = p.image ? '<img src="' + p.image + '"' + fit + '>' : 'Фото';
  return '<div class="card"><div class="img">' + picture + badge + '</div>' +
    '<h3>' + p.name + '</h3><p class="desc" title="' + p.desc + '">' + p.desc + '</p>' +
    '<div class="row">' + price +
    '<div class="ctrl" data-id="' + p.id + '" data-qty="' + qtyOf(p.id) + '">' + ctrlHtml(p.id) + '</div>' +
    '</div></div>';
}

// ---------- Корзина ----------
function addToCart(id) {
  const item = cart.find(c => c.id === id);
  if (item) item.qty++; else cart.push({ id: id, qty: 1 });
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart();
}

function saveCart() { DB.set('cart', cart); renderCart(); updateCtrls(); }

function setMode(m) { mode = m; renderCart(); }

// Расчёт заказа: строки чека, суммы, скидка, доставка, итог
function calcOrder() {
  const products = getProducts();
  const lines = [];
  let sum = 0, saved = 0, count = 0;
  cart.forEach(c => {
    const p = products.find(x => x.id === c.id);
    if (!p) return;
    lines.push({ name: p.name, qty: c.qty, price: p.price, total: p.price * c.qty });
    sum += p.price * c.qty;
    if (p.oldPrice > p.price) saved += (p.oldPrice - p.price) * c.qty;
    count += c.qty;
  });
  let delivery = 0;
  if (mode === 'delivery' && sum > 0 && sum < FREE_DELIVERY_FROM) delivery = DELIVERY_PRICE;
  return { lines: lines, sum: sum, saved: saved, count: count, delivery: delivery, total: sum + delivery };
}

// Время: самовывоз 15–20 мин, доставка 30–45 мин (+15 мин, если в заказе больше 5 позиций)
function calcTime(count) {
  let min = 30, max = 45;
  if (mode === 'pickup') { min = 15; max = 20; }
  else if (count > 5) { min += 15; max += 15; }
  const now = Date.now();
  const fmt = t => new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return { text: min + '–' + max + ' мин', clock: fmt(now + min * 60000) + '–' + fmt(now + max * 60000) };
}

function renderCart() {
  const o = calcOrder();
  let html = '';
  cart.forEach(c => {
    const p = getProducts().find(x => x.id === c.id);
    if (!p) return;
    html += '<div class="cart-item"><span>' + p.name + '</span><span>' +
      '<button onclick="changeQty(' + c.id + ',-1)">−</button> ' + c.qty + ' ' +
      '<button onclick="changeQty(' + c.id + ',1)">+</button></span></div>';
  });
  document.getElementById('cartList').innerHTML = html || '<p class="desc">Корзина пуста</p>';

  // Самовывоз или доставка
  document.getElementById('address').style.display = mode === 'delivery' ? 'block' : 'none';
  const pickup = document.getElementById('pickupInfo');
  pickup.style.display = mode === 'pickup' ? 'block' : 'none';
  pickup.textContent = 'Адрес самовывоза: ' + PICKUP_ADDRESS;

  // Подсказка про бесплатную доставку
  const hint = document.getElementById('freeHint');
  if (mode === 'pickup' || o.sum === 0) hint.innerHTML = '';
  else if (o.sum >= FREE_DELIVERY_FROM) hint.innerHTML = '<b class="green">Доставка бесплатно!</b>';
  else hint.innerHTML = 'До бесплатной доставки: <b class="green">' + (FREE_DELIVERY_FROM - o.sum) + ' ₽</b>';

  const t = calcTime(o.count);
  document.getElementById('timeInfo').textContent = 'Время: ' + t.text + ' (примерно ' + t.clock + ')';
  document.getElementById('cartTotal').textContent = 'Итого: ' + o.total + ' ₽';
}

// ---------- Чек ----------
function showCheck() {
  const o = calcOrder();
  if (o.lines.length === 0) { alert('Корзина пуста'); return; }
  let html = '';
  o.lines.forEach(l => {
    html += '<div class="sum"><span>' + l.name + ' (' + l.qty + ' × ' + l.price + ' ₽)</span><span>' + l.total + ' ₽</span></div>';
  });
  html += '<div class="sum"><span>Сумма товаров</span><span>' + o.sum + ' ₽</span></div>';
  if (o.saved > 0) html += '<div class="sum green"><span>Ваша выгода</span><span>' + o.saved + ' ₽</span></div>';
  if (mode === 'pickup') html += '<div class="sum"><span>Самовывоз</span><span>0 ₽</span></div>';
  else if (o.delivery === 0) html += '<div class="sum green"><span>Доставка</span><span>бесплатно</span></div>';
  else html += '<div class="sum"><span>Доставка</span><span>' + o.delivery + ' ₽</span></div>';
  html += '<div class="sum big"><span>К оплате</span><span>' + o.total + ' ₽</span></div>';
  document.getElementById('checkBody').innerHTML = html;
  document.getElementById('checkModal').classList.add('open');
}

// ---------- Оформление заказа ----------
function checkout() {
  const user = getCurrentUser();
  if (!user) { openAuth(); return; }
  const o = calcOrder();
  if (o.lines.length === 0) { alert('Корзина пуста'); return; }

  const address = document.getElementById('address').value.trim();
  if (mode === 'delivery' && address === '') { alert('Укажите адрес доставки'); return; }

  const orders = getOrders();
  orders.push({
    id: orders.length + 1,
    email: user.email,
    items: o.lines.map(l => l.name + ' x' + l.qty).join(', '),
    type: mode === 'pickup' ? 'Самовывоз' : 'Доставка: ' + address,
    time: calcTime(o.count).text,
    total: o.total,
    date: new Date().toLocaleString()
  });
  saveOrders(orders);

  cart = [];
  saveCart();
  alert('Заказ оформлен! Ожидайте: ' + calcTime(o.count).text);
}

// ---------- Запуск ----------
renderUser();
renderTabs();
renderMenu();
renderDeals();
renderCart();