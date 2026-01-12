/**
 * Компонент навигации
 * 
 * Читает структуру из routes.json и показывает меню
 * Структуру можно легко менять через routes.json
 */

class Navigation {
  constructor(routes) {
    this.routes = routes;
  }

  /**
   * Рендерит главное меню навигации
   */
  renderMainNav(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Фильтруем маршруты для главного меню (только основные разделы)
    const mainRoutes = this.routes.routes.filter(r => 
      r.in_sitemap !== false && 
      !r.path.startsWith('/page/') &&
      ['/', '/kb', '/portfolio', '/think-tank', '/nav'].includes(r.path)
    );

    const navHTML = mainRoutes.map(route => {
      const path = route.path === '/' ? '#' : `#${route.path}`;
      const isActive = window.location.hash === path || 
                      (window.location.hash === '' && route.path === '/');
      
      return `
        <a href="${path}" class="nav-link ${isActive ? 'active' : ''}" 
           data-route="${route.path}">
          ${this.escapeHtml(route.title)}
        </a>
      `;
    }).join('');

    container.innerHTML = navHTML;

    // Добавляем обработчики кликов
    container.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        if (route) {
          window.location.hash = route === '/' ? '' : route;
        }
      });
    });
  }

  /**
   * Рендерит быструю навигацию (карточки разделов)
   */
  renderQuickNav(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Основные разделы для быстрой навигации
    const quickRoutes = this.routes.routes.filter(r => 
      r.in_sitemap !== false && 
      !r.path.startsWith('/page/') &&
      ['/kb', '/portfolio', '/think-tank'].includes(r.path)
    );

    const cardsHTML = quickRoutes.map(route => {
      const path = `#${route.path}`;
      return `
        <div class="nav-card" data-route="${route.path}">
          <h3>${this.escapeHtml(route.title)}</h3>
          <p>${this.escapeHtml(route.og?.description || '')}</p>
          <a href="${path}" class="nav-card-link">Перейти →</a>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHTML;

    // Обработчики кликов
    container.querySelectorAll('.nav-card-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const card = link.closest('.nav-card');
        const route = card.getAttribute('data-route');
        if (route) {
          window.location.hash = route;
        }
      });
    });
  }

  /**
   * Рендерит breadcrumbs (хлебные крошки)
   */
  renderBreadcrumbs(containerId, currentRoute) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const routeData = this.routes.routes.find(r => r.path === currentRoute);
    if (!routeData || currentRoute === '/') {
      container.innerHTML = '';
      return;
    }

    const breadcrumbs = [
      { path: '/', title: 'Главная' },
      { path: currentRoute, title: routeData.title }
    ];

    const breadcrumbsHTML = breadcrumbs.map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      const path = crumb.path === '/' ? '#' : `#${crumb.path}`;
      
      if (isLast) {
        return `<span class="breadcrumb-current">${this.escapeHtml(crumb.title)}</span>`;
      }
      
      return `
        <a href="${path}" class="breadcrumb-link">${this.escapeHtml(crumb.title)}</a>
        <span class="breadcrumb-separator"> › </span>
      `;
    }).join('');

    container.innerHTML = `<nav class="breadcrumbs">${breadcrumbsHTML}</nav>`;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Navigation;
}
