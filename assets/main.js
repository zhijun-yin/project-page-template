(() => {
  'use strict';
  const config = window.PROJECT_PAGE || {};
  const roots = document.querySelectorAll('.pht-site');
  const safeUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  };
  let savedTheme = '';
  try { savedTheme = localStorage.getItem('project-page-theme') || ''; } catch {}
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  let theme = ['light', 'dark'].includes(savedTheme) ? savedTheme : 'system';

  function syncTheme() {
    roots.forEach((root) => {
      root.dataset.theme = theme;
      const button = root.querySelector('[data-theme-toggle]');
      if (button) {
        const dark = theme === 'dark' || (theme === 'system' && systemDark.matches);
        button.setAttribute('aria-label', dark ? '切换到浅色外观' : '切换到深色外观');
        button.setAttribute('aria-pressed', String(dark));
        button.dataset.dark = String(dark);
      }
    });
  }
  systemDark.addEventListener('change', syncTheme);
  roots.forEach((root) => {
    root.querySelectorAll('[data-text]').forEach((element) => {
      const value = config[element.dataset.text];
      if (typeof value === 'string') element.textContent = value;
    });
    root.querySelectorAll('[data-author]').forEach((element, index) => {
      if (config.authors && typeof config.authors[index] === 'string') element.textContent = config.authors[index];
    });
    root.querySelectorAll('[data-feature]').forEach((element, index) => {
      const feature = config.features && config.features[index];
      if (!feature) return;
      ['label', 'title', 'description'].forEach((key) => {
        const target = element.querySelector('[data-feature-' + key + ']');
        if (target && typeof feature[key] === 'string') target.textContent = feature[key];
      });
    });
    root.querySelectorAll('[data-link]').forEach((element) => {
      const url = safeUrl(config.links && config.links[element.dataset.link]);
      if (url) {
        element.href = url;
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
        element.removeAttribute('aria-disabled');
        const pending = element.querySelector('.pht-pending');
        if (pending) pending.remove();
      } else {
        element.removeAttribute('href');
        element.setAttribute('aria-disabled', 'true');
      }
    });
    const citation = root.querySelector('[data-citation]');
    if (citation && typeof config.citation === 'string') citation.textContent = config.citation;
    const themeButton = root.querySelector('[data-theme-toggle]');
    if (themeButton) themeButton.addEventListener('click', () => {
      const currentDark = theme === 'dark' || (theme === 'system' && systemDark.matches);
      theme = currentDark ? 'light' : 'dark';
      try { localStorage.setItem('project-page-theme', theme); } catch {}
      syncTheme();
    });
    const menu = root.querySelector('[data-menu]');
    const menuButton = root.querySelector('[data-menu-toggle]');
    if (menu && menuButton) {
      menuButton.addEventListener('click', () => {
        const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
        menuButton.setAttribute('aria-expanded', String(expanded));
        menu.dataset.open = String(expanded);
      });
      menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menu.dataset.open = 'false';
      }));
      root.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
          menuButton.setAttribute('aria-expanded', 'false');
          menu.dataset.open = 'false';
          menuButton.focus();
        }
      });
    }
    const copy = root.querySelector('[data-copy-citation]');
    if (copy && citation) copy.addEventListener('click', async () => {
      const status = root.querySelector('[data-copy-status]');
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(citation.textContent);
        if (status) status.textContent = '引用已复制';
      } catch {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(citation);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        if (status) status.textContent = '引用已选中，请手动复制';
      }
    });
  });
  syncTheme();
})();
