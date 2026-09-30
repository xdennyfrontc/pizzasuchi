/* ===== Тёмная тема: класс "dark" на <body>, выбор запоминается ===== */
function applyTheme() {
  const dark = DB.get('theme', 'light') === 'dark';
  document.body.classList.toggle('dark', dark);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = dark ? '☀️' : '🌙';
}
function toggleTheme(event) {
  const newTheme = DB.get('theme', 'light') === 'dark' ? 'light' : 'dark';

  // Если браузер не поддерживает анимацию, просто переключаем тему сразу
  if (!document.startViewTransition) {
    DB.set('theme', newTheme);
    applyTheme();
    return;
  }

  // Центр кнопки — точка, из которой пойдёт круг
  const rect = event.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Радиус круга = расстояние до самого дальнего угла экрана, чтобы круг закрыл всё
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // Браузер делает снимок «до», мы меняем тему, он делает снимок «после»
  const transition = document.startViewTransition(() => {
    DB.set('theme', newTheme);
    applyTheme();
  });

  // Анимируем «новый» снимок: круг растёт от 0 до полного радиуса
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [
        'circle(0px at ' + x + 'px ' + y + 'px)',
        'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'
      ] },
      { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
    );
  });
}
applyTheme();