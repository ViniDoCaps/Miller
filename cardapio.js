document.addEventListener('DOMContentLoaded', () => {
  const buttons = [...document.querySelectorAll('.filter-btn')];
  const items = [...document.querySelectorAll('.menu-item')];
  const count = document.querySelector('.menu-count');
  const empty = document.querySelector('.menu-empty');

  const updateMenu = (filter) => {
    let visibleItems = 0;
    items.forEach((item) => {
      const visible = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('is-hidden', !visible);
      if (visible) visibleItems += 1;
    });
    count.textContent = `${visibleItems} ${visibleItems === 1 ? 'item' : 'itens'}`;
    empty.hidden = visibleItems !== 0;
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((current) => {
      const active = current === button;
      current.classList.toggle('is-active', active);
      current.setAttribute('aria-pressed', String(active));
    });
    updateMenu(button.dataset.filter);
  }));
});
