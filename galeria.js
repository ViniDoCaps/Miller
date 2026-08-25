document.addEventListener('DOMContentLoaded', () => {
  const items = [...document.querySelectorAll('.gallery-item')];
  const filters = [...document.querySelectorAll('.gallery-filter')];
  const empty = document.querySelector('.gallery-empty');
  let lightbox;

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.remove();
    lightbox = undefined;
    document.body.style.overflow = '';
  };

  const openLightbox = (item) => {
    const image = item.querySelector('img');
    lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', item.dataset.title);
    const figure = document.createElement('figure');
    figure.className = 'gallery-lightbox__figure';
    const enlarged = document.createElement('img');
    enlarged.className = 'gallery-lightbox__image';
    enlarged.src = image.src;
    enlarged.alt = image.alt;
    const caption = document.createElement('figcaption');
    caption.className = 'gallery-lightbox__caption';
    const title = document.createElement('strong');
    title.textContent = item.dataset.title;
    const description = document.createElement('span');
    description.textContent = item.dataset.caption;
    caption.append(title, description);
    const close = document.createElement('button');
    close.className = 'gallery-lightbox__close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar imagem ampliada');
    close.textContent = '×';
    figure.append(enlarged, caption);
    lightbox.append(figure, close);
    document.body.append(lightbox);
    document.body.style.overflow = 'hidden';
    close.focus();
    close.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
    lightbox.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });
  };

  items.forEach((item) => item.addEventListener('click', () => openLightbox(item)));
  filters.forEach((filter) => filter.addEventListener('click', () => {
    filters.forEach((current) => { const active = current === filter; current.classList.toggle('is-active', active); current.setAttribute('aria-pressed', String(active)); });
    let visible = 0;
    items.forEach((item) => { const shown = filter.dataset.filter === 'all' || item.dataset.category === filter.dataset.filter; item.classList.toggle('is-hidden', !shown); if (shown) visible += 1; });
    empty.hidden = visible !== 0;
  }));
});
