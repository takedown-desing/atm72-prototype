/* Прототип «АТМ Альянс»: небольшая интерактивность без зависимостей. */
(function () {
  var d = document;
  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* Пометки блоков: показать / скрыть, состояние запоминается в localStorage */
  var toggle = qs('[data-toggle-tags]');
  try { if (localStorage.getItem('atm72-hide-tags') === '1') d.body.classList.add('hide-tags'); } catch (e) {}
  function syncToggle() {
    if (!toggle) return;
    toggle.textContent = d.body.classList.contains('hide-tags') ? 'Показать пометки' : 'Скрыть пометки';
  }
  syncToggle();
  if (toggle) toggle.addEventListener('click', function () {
    d.body.classList.toggle('hide-tags');
    try { localStorage.setItem('atm72-hide-tags', d.body.classList.contains('hide-tags') ? '1' : '0'); } catch (e) {}
    syncToggle();
  });

  /* Даты в формах бронирования: сегодня и завтра */
  function iso(dt) { return dt.toISOString().slice(0, 10); }
  var today = new Date(), tomorrow = new Date(Date.now() + 86400000);
  qsa('input[data-date="in"]').forEach(function (i) { if (!i.value) i.value = iso(today); });
  qsa('input[data-date="out"]').forEach(function (i) { if (!i.value) i.value = iso(tomorrow); });

  /* Мобильное меню */
  var drawer = qs('.drawer');
  qsa('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { drawer && drawer.classList.add('open'); }); });
  qsa('[data-close-menu]').forEach(function (b) { b.addEventListener('click', function () { drawer && drawer.classList.remove('open'); }); });
  if (drawer) drawer.addEventListener('click', function (e) { if (e.target === drawer) drawer.classList.remove('open'); });

  /* Модальное окно: вопрос менеджеру, подбор номера, бронирование услуги */
  var modal = qs('.modal');
  function openModal(title, sub, product) {
    if (!modal) return;
    if (title) qs('.modal h3').textContent = title;
    if (sub) qs('.modal .sub').textContent = sub;
    var pl = qs('.modal .prod-line');
    if (pl) pl.style.display = product ? 'flex' : 'none';
    if (pl && product) qs('.modal .prod-line span').textContent = product;
    modal.classList.add('open');
  }
  qsa('[data-ask]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(b.getAttribute('data-ask-title'), b.getAttribute('data-ask-sub'), b.getAttribute('data-ask-product'));
    });
  });
  qsa('[data-close-modal]').forEach(function (b) { b.addEventListener('click', function () { modal && modal.classList.remove('open'); }); });
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) modal.classList.remove('open'); });

  /* Все формы прототипа: не отправляем, показываем подтверждение */
  qsa('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = qs('button[type="submit"]', f);
      var msg = f.getAttribute('data-done') || 'Принято, менеджер ответит в течение 15 минут';
      if (btn) { btn.textContent = msg; btn.disabled = true; }
    });
  });

  /* Табы-фильтры (поводы, номера по корпусам, отзывы) */
  qsa('[data-tabs]').forEach(function (wrap) {
    var tabs = qsa('.tab, .subcats a', wrap);
    var target = qs(wrap.getAttribute('data-tabs'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        tabs.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        var f = t.getAttribute('data-filter');
        qsa('[data-niche]', target).forEach(function (c) {
          var v = (c.getAttribute('data-niche') || '').split(' ');
          c.style.display = (f === 'all' || v.indexOf(f) > -1) ? '' : 'none';
        });
      });
    });
  });

  /* Табы карточки номера */
  qsa('.p-tabs').forEach(function (wrap) {
    var btns = qsa('button', wrap);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        qsa('.p-panel').forEach(function (p) { p.classList.toggle('active', p.id === b.getAttribute('data-panel')); });
      });
    });
  });

  /* Галерея */
  var main = qs('.gallery .main img');
  var cap = qs('.gallery .main .chip');
  qsa('.gallery .thumbs div').forEach(function (t) {
    t.addEventListener('click', function () {
      qsa('.gallery .thumbs div').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      var img = qs('img', t);
      if (img && main) main.src = img.src;
      if (cap && t.getAttribute('data-cap')) cap.textContent = t.getAttribute('data-cap');
    });
  });

  /* Выбор тарифа в карточке */
  qsa('.tariff[data-price]').forEach(function (t) {
    t.addEventListener('click', function () {
      qsa('.tariff').forEach(function (x) { x.classList.remove('best'); });
      t.classList.add('best');
      var out = qs('[data-tariff-price]');
      if (out) out.textContent = 'от ' + parseInt(t.getAttribute('data-price'), 10).toLocaleString('ru-RU') + ' ₽';
      var nm = qs('[data-tariff-name]');
      if (nm) nm.textContent = t.getAttribute('data-name') || '';
    });
  });

  /* Фильтры в листинге на мобильном */
  var filters = qs('.filters');
  qsa('[data-open-filters]').forEach(function (b) { b.addEventListener('click', function () { filters && filters.classList.add('open'); }); });
  qsa('[data-close-filters]').forEach(function (b) { b.addEventListener('click', function () { filters && filters.classList.remove('open'); }); });

  /* Услуги к проживанию: пересчёт суммы */
  function recalc() {
    var sum = 0;
    qsa('.cross input[type="checkbox"]:checked').forEach(function (c) { sum += parseInt(c.getAttribute('data-price') || '0', 10); });
    var baseEl = qs('[data-base-price]');
    var base = baseEl ? parseInt(baseEl.getAttribute('data-base-price'), 10) || 0 : 0;
    var out = qs('[data-cross-sum]');
    if (out) out.textContent = (base + sum).toLocaleString('ru-RU') + ' ₽';
    var cnt = qs('[data-cross-cnt]');
    if (cnt) cnt.textContent = qsa('.cross input[type="checkbox"]:checked').length;
  }
  qsa('.cross input[type="checkbox"]').forEach(function (c) { c.addEventListener('change', recalc); });
  recalc();

  /* Активная ссылка в панели прототипа */
  var path = location.pathname.split('/').pop();
  qsa('.proto-bar nav a').forEach(function (a) {
    if (a.getAttribute('href').split('/').pop() === path) a.classList.add('active');
  });
})();
