document.addEventListener('DOMContentLoaded', () => {
  const config = window.ESPRESSO_SUPABASE || {};
  const form = document.querySelector('#review-form');
  const submitButton = form.querySelector('button[type="submit"]');
  const list = document.querySelector('#review-list');
  const emptyState = document.querySelector('#review-empty');
  const status = document.querySelector('#form-status');
  const storageNote = document.querySelector('#storage-note');
  const score = document.querySelector('.score-value');
  const stars = document.querySelector('.score-stars');
  const total = document.querySelector('.review-total');
  const configFileLoaded = Object.prototype.hasOwnProperty.call(window, 'ESPRESSO_SUPABASE');
  const configured = /^https:\/\/[^\s]+/.test(config.url || '') && Boolean(config.anonKey);
  const localFile = window.location.protocol === 'file:';
  const endpoint = configured ? `${config.url.replace(/\/$/, '')}/rest/v1/reviews` : '';

  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle('is-error', error);
  };

  const apiRequest = async (options = {}) => {
    const response = await fetch(endpoint + (options.query || ''), {
      method: options.method || 'GET',
      headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!response.ok) throw new Error(`Supabase respondeu ${response.status}`);
    return response.status === 204 ? null : response.json();
  };

  const loadReviews = () => apiRequest({ query: '?select=id,name,rating,comment,created_at&order=created_at.desc' });
  const saveReview = (review) => apiRequest({ method: 'POST', query: '?select=id,name,rating,comment,created_at', headers: { Prefer: 'return=representation' }, body: review });
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
      const amount = distribution[row.dataset.ratingRow];
      row.querySelector('strong').textContent = amount;
      row.querySelector('i').style.width = reviews.length ? `${(amount / reviews.length) * 100}%` : '0%';
    });
  };

  const renderReviews = (reviews) => {
    list.replaceChildren();
    emptyState.hidden = reviews.length > 0;
    reviews.forEach((review) => {
      const card = document.createElement('article');
      card.className = 'review-card';
      const top = document.createElement('div');
      top.className = 'review-card__top';
      const name = document.createElement('h3');
      name.className = 'review-card__name';
      name.textContent = review.name;
      const date = document.createElement('time');
      date.className = 'review-card__date';
      date.dateTime = review.created_at;
      date.textContent = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(review.created_at));
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

  const render = async () => {
    if (localFile) {
      submitButton.disabled = true;
      setStatus('Abra o site por um servidor local (Live Server) para conectar ao Supabase.', true);
      storageNote.textContent = 'O navegador bloqueia chamadas da API quando a página é aberta diretamente como file://.';
      renderSummary([]);
      renderReviews([]);
      return;
    }
    if (!configFileLoaded || !configured) {
      submitButton.disabled = true;
      setStatus(!configFileLoaded ? 'O arquivo supabase-config.js não foi carregado.' : 'A URL ou a chave pública do Supabase está inválida.', true);
      storageNote.textContent = 'Confira supabase-config.js e execute avaliacoes-schema.sql no Supabase.';
      renderSummary([]);
      renderReviews([]);
      return;
    }
    try {
      const reviews = await loadReviews();
      renderSummary(reviews);
      renderReviews(reviews);
    } catch {
      setStatus('Não foi possível carregar as avaliações agora. Tente novamente em instantes.', true);
      renderSummary([]);
      renderReviews([]);
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('');
    if (!form.reportValidity()) return;
    if (!configured) { setStatus('Configure o Supabase antes de publicar uma avaliação.', true); return; }
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const comment = String(data.get('comment')).trim();
    const rating = Number(data.get('rating'));
    if (name.length < 2 || comment.length < 10) { setStatus('Confira seu nome e escreva pelo menos 10 caracteres no comentário.', true); return; }
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    try {
      await saveReview({ name, comment, rating });
      form.reset();
      setStatus('Obrigado! Sua avaliação foi publicada para todos os visitantes.');
      await render();
    } catch {
      setStatus('Não foi possível publicar agora. Tente novamente em instantes.', true);
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  });

  render();
});
