/* ===== Слой данных =====
   Сейчас данные хранятся в localStorage браузера.
   Когда подключат БД — меняются только функции этого файла (на fetch-запросы к серверу),
   остальной код сайта трогать не нужно. */

const DB = {
  get(key, def) { return JSON.parse(localStorage.getItem(key)) || def; },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

/* Настройки заказа */
const FREE_DELIVERY_FROM = 1500;            // бесплатная доставка от этой суммы
const DELIVERY_PRICE = 150;                 // стоимость доставки
const PICKUP_ADDRESS = 'ул. Центральная, 1'; // адрес самовывоза (замените на свой)

/* Категории меню */
const CATEGORIES = [
  { id: 'pizza', name: 'Пицца' },       { id: 'minipizza', name: 'Пиццы-мини' },
  { id: 'rolls', name: 'Роллы' },       { id: 'assorti', name: 'Ассорти' },
  { id: 'wok', name: 'Wok' },           { id: 'snacks', name: 'Закуски' },
  { id: 'soups', name: 'Супы' },        { id: 'salads', name: 'Салаты' },
  { id: 'sauces', name: 'Соусы' },      { id: 'desserts', name: 'Десерты' },
  { id: 'drinks', name: 'Вода и напитки' }, { id: 'combo', name: 'Комбо' }
];

/* Стартовое меню. price — текущая цена, oldPrice — прежняя (0 = скидки нет).
   В поле image потом впишите путь к фото, например "img/margarita.jpg".
   Пока image пустой — на карточке показывается заглушка. */
const defaultProducts = [
  { id: 1,  category: 'pizza',     name: 'Маргарита',        desc: 'Томаты, моцарелла, базилик', price: 490,  oldPrice: 0,   image: 'img/piz1.webp' },
  { id: 2,  category: 'pizza',     name: 'Пепперони',        desc: 'Пепперони, моцарелла, соус', price: 590,  oldPrice: 690, image: 'img/piz2.webp' },
  { id: 3,  category: 'minipizza', name: 'Мини Маргарита',   desc: '20 см, томаты, моцарелла',   price: 250,  oldPrice: 0,   image: 'img/piz3.webp', fit: 'contain'},
  { id: 4,  category: 'rolls',     name: 'Филадельфия',      desc: '8 шт: лосось, сливочный сыр', price: 520, oldPrice: 620, image: 'img/sch1.webp' },
  { id: 5,  category: 'rolls',     name: 'Калифорния',       desc: '8 шт: краб, авокадо, икра',  price: 480,  oldPrice: 0,   image: 'img/sch2.webp' },
  { id: 6,  category: 'assorti',   name: 'Сет «Классика»',   desc: '24 шт: три вида роллов',     price: 1290, oldPrice: 0,   image: 'img/sch3.webp', fit: 'contain'},
  { id: 7,  category: 'wok',       name: 'Wok с курицей',    desc: 'Лапша, курица, овощи',       price: 390,  oldPrice: 0,   image: 'img/wok1.webp', fit: 'contain'},
  { id: 8,  category: 'snacks',    name: 'Картофель фри',    desc: 'Порция 150 г',               price: 190,  oldPrice: 0,   image: 'img/fre1.webp' },
  { id: 9,  category: 'soups',     name: 'Том Ям',           desc: 'С креветками, 350 мл',       price: 420,  oldPrice: 520, image: 'img/sup1.webp', fit: 'contain'},
  { id: 10, category: 'salads',    name: 'Цезарь с курицей', desc: 'Романо, курица, пармезан',   price: 350,  oldPrice: 0,   image: 'img/slt1.webp', fit: 'contain'},
  { id: 11, category: 'sauces',    name: 'Соевый соус',      desc: '30 мл',                      price: 50,   oldPrice: 0,   image: 'img/sous1.webp' },
  { id: 12, category: 'desserts',  name: 'Чизкейк',          desc: 'Классический, 120 г',        price: 260,  oldPrice: 320, image: 'img/desert1.webp', fit: 'contain' },
  { id: 13, category: 'drinks',    name: 'Морс клюквенный',  desc: '0,5 л',                      price: 120,  oldPrice: 0,   image: 'img/voda1.webp', fit: 'contain'},
  { id: 14, category: 'combo',     name: 'Осеннее комбо', desc: 'Пицца Шеф Гриль Мини; Пицца Чикен Бекон Мини; Пицца Шашлычная Мини; Пицца Чизбургер Мини; Coca-Cola 1л',    price: 1499,  oldPrice: 1650, image: 'img/kombo1.webp', fit: 'contain'}
];

function getProducts() {
  const list = DB.get('menu', defaultProducts);
  return list.slice().sort((a, b) => a.id - b.id);   // меньше ID — выше в меню
}
function saveProducts(list) { DB.set('menu', list); }

/* Администратор создаётся автоматически: admin@pizza.ru / admin123 */
function getUsers() {
  return DB.get('users', [{ name: 'Админ', email: 'admin@pizza.ru', password: 'admin123', role: 'admin' }]);
}
function saveUsers(list) { DB.set('users', list); }

function getOrders() { return DB.get('orders', []); }
function saveOrders(list) { DB.set('orders', list); }

function getCurrentUser() { return DB.get('currentUser', null); }
function setCurrentUser(user) { DB.set('currentUser', user); }