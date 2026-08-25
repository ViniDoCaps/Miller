document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.footer-column a[href="#"], .footer-bottom a[href="#"]').forEach((link) => {
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('tabindex', '-1');
    link.addEventListener('click', (event) => event.preventDefault());
  });

  document.querySelectorAll('.social-nav a, .footer-socials a').forEach((link) => {
    const network = link.getAttribute('aria-label') || 'rede social';
    link.href = 'easter-egg.html';
    link.setAttribute('aria-label', `${network} — abrir surpresa`);
    link.removeAttribute('aria-disabled');
    link.removeAttribute('tabindex');
  });

  document.querySelectorAll('.footer-bottom > div').forEach((container) => {
    if (container.querySelector('[data-theme-toggle]')) return;
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.type = 'button';
    button.dataset.themeToggle = '';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', 'Ativar modo escuro');
    button.innerHTML = '<span class="theme-toggle__icon" aria-hidden="true">☾</span><span class="theme-toggle__label">Modo escuro</span>';
    container.append(button);
  });

  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const themeKey = 'espresso-royale-theme';
  const root = document.documentElement;

  if (!themeButtons.length) return;

  const readStoredTheme = () => {
    try {
      return localStorage.getItem(themeKey);
    } catch {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      // O tema continua funcionando mesmo quando o armazenamento está bloqueado.
    }
  };

  const updateThemeButton = (theme) => {
    const darkMode = theme === 'dark';
    themeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(darkMode));
      button.setAttribute('aria-label', darkMode ? 'Ativar modo claro' : 'Ativar modo escuro');
      const icon = button.querySelector('.theme-toggle__icon');
      const label = button.querySelector('.theme-toggle__label');
      if (icon) icon.textContent = darkMode ? '☀' : '☾';
      if (label) label.textContent = darkMode ? 'Modo claro' : 'Modo escuro';
    });
  };

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;
    updateThemeButton(theme);
    if (persist) saveTheme(theme);
  };

  const storedTheme = readStoredTheme();
  const initialTheme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
  applyTheme(initialTheme);

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  });
});
