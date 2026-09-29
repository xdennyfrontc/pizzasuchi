/* ===== Регистрация, вход, капча ===== */

let captchaAnswer = 0; // правильный ответ на капчу

// Капча: случайный пример на сложение
function newCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  captchaAnswer = a + b;
  document.getElementById('captchaText').textContent = 'Сколько будет ' + a + ' + ' + b + '?';
  document.getElementById('captchaInput').value = '';
}

function openAuth() { document.getElementById('authModal').classList.add('open'); showForm('login'); }
function closeAuth() { document.getElementById('authModal').classList.remove('open'); }

function showForm(name) {
  document.getElementById('loginForm').style.display = name === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = name === 'register' ? 'block' : 'none';
  if (name === 'register') newCaptcha();
}

function register() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const captcha = document.getElementById('captchaInput').value;
  const error = document.getElementById('regError');

  // Проверки по порядку
  if (name === '' || email === '' || pass === '') { error.textContent = 'Заполните все поля'; return; }
  if (pass.length < 6) { error.textContent = 'Пароль должен быть не короче 6 символов'; return; }
  if (Number(captcha) !== captchaAnswer) { error.textContent = 'Капча решена неверно'; newCaptcha(); return; }

  const users = getUsers();
  if (users.some(u => u.email === email)) { error.textContent = 'Такой email уже зарегистрирован'; return; }

  const user = { name: name, email: email, password: pass, role: 'user' };
  users.push(user);
  saveUsers(users);
  setCurrentUser(user); // сразу входим
  closeAuth();
  renderUser();
}

function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const user = getUsers().find(u => u.email === email && u.password === pass);
  if (!user) { document.getElementById('loginError').textContent = 'Неверный email или пароль'; return; }
  setCurrentUser(user);
  closeAuth();
  renderUser();
}

function logout() {
  localStorage.removeItem('currentUser');
  renderUser();
}