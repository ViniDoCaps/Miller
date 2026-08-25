document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'espresso-royale-reviews-v1';
  const form = document.querySelector('#review-form');
  const list = document.querySelector('#review-list');
  const emptyState = document.querySelector('#review-empty');
  const status = document.querySelector('#form-status');
  const score = document.querySelector('.score-value');
  const stars = document.querySelector('.score-stars');
  const total = document.querySelector('.review-total');

  const loadReviews = () => {
    try {
      const reviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(reviews) ? reviews.filter((review) => review && review.name && review.comment && Number(review.rating) >= 1 && Number(review.rating) <= 5) : [];
    } catch {
      return [];
    }
  };

  const saveReviews = (reviews) => localStorage.setItem(storageKey, JSON.stringify(reviews));

  const starsFor = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const renderSummary = (reviews) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => { distribution[Number(review.rating)] += 1; });
    const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length : 0;
    score.textContent = average.toFixed(1).replace('.', ',');
    stars.textContent = reviews.length ? starsFor(Math.round(average)) : '☆☆☆☆☆';
    stars.setAttribute('aria-label', reviews.length ? `Média de ${average.toFixed(1)} de 5 estrelas` : 'Nenhuma avaliação ainda');
    total.textContent = reviews.length;
    document.querySelectorAll('.rating-row').forEach((row) => {
      const rating = row.dataset.ratingRow;
      const amount = distribution[rating];
      row.querySelector('strong').textContent = amount;
      row.querySelector('i').style.width = reviews.length ? `${(amount / reviews.length) * 100}%` : '0%';
    });
  };

  const renderReviews = (reviews) => {
    list.replaceChildren();
    emptyState.hidden = reviews.length > 0;
    reviews.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach((review) => {
      const card = document.createElement('article');
      card.className = 'review-card';
      const top = document.createElement('div');
      top.className = 'review-card__top';
      const name = document.createElement('h3');
      name.className = 'review-card__name';
      name.textContent = review.name;
      const date = document.createElement('time');
      date.className = 'review-card__date';
      date.dateTime = review.createdAt;
      date.textContent = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(review.createdAt));
      top.append(name, date);
      const rating = document.createElement('div');
      rating.className = 'review-card__stars';
      rating.setAttribute('aria-label', `${review.rating} de 5 estrelas`);
      rating.textContent = starsFor(Number(review.rating));
      const comment = document.createElement('p');
      comment.className = 'review-card__text';
      comment.textContent = review.comment;
      card.append(top, rating, comment);
      list.append(card);
    });
  };

  const render = () => {
    const reviews = loadReviews();
    renderSummary(reviews);
    renderReviews(reviews);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const comment = String(data.get('comment')).trim();
    const rating = Number(data.get('rating'));
    if (name.length < 2 || comment.length < 10) {
      status.textContent = 'Confira seu nome e escreva pelo menos 10 caracteres no comentário.';
      status.classList.add('is-error');
      return;
    }
    try {
      const reviews = loadReviews();
      reviews.push({ id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()), name, comment, rating, createdAt: new Date().toISOString() });
      saveReviews(reviews);
      form.reset();
      status.textContent = 'Obrigado! Sua avaliação foi publicada neste navegador.';
      render();
    } catch {
      status.textContent = 'Não foi possível salvar agora. Tente novamente neste navegador.';
      status.classList.add('is-error');
    }
  });

  render();
});
