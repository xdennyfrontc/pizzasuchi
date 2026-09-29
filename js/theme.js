/* ===== Тёмная тема: класс "dark" на <body>, выбор запоминается ===== */
function applyTheme() {
  const dark = DB.get('theme', 'light') === 'dark';
  document.body.classList.toggle('dark', dark);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = dark ? '☀️' : '🌙';
}
function toggleTheme() {
  DB.set('theme', DB.get('theme', 'light') === 'dark' ? 'light' : 'dark');
  applyTheme();
}
applyTheme();