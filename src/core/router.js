/**
 * Простой роутер для hash-based navigation
 * 
 * Читает структуру из routes.json и показывает нужную страницу
 */

class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = '/';
    this.init();
  }

  init() {
    // Слушаем изменения hash
    window.addEventListener('hashchange', () => this.handleRoute());
    // Обрабатываем текущий hash при загрузке
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    this.currentRoute = hash;
    this.showPage(hash);
  }

  showPage(route) {
    // Находим маршрут в routes.json
    const routeData = this.routes.routes.find(r => r.path === route);
    
    if (!routeData) {
      // Если маршрут не найден, показываем главную
      this.showPage('/');
      return;
    }

    // Обновляем title страницы
    document.title = routeData.og?.title || routeData.title || 'Vova & Petrova';

    // Показываем нужную страницу
    this.renderPage(routeData);
  }

  renderPage(routeData) {
    const main = document.querySelector('main');
    if (!main) return;

    // Определяем тип страницы по пути
    if (routeData.path === '/') {
      main.innerHTML = this.renderHomePage();
    } else if (routeData.path === '/kb') {
      main.innerHTML = this.renderKBPage();
    } else if (routeData.path === '/portfolio') {
      main.innerHTML = this.renderPortfolioPage();
    } else if (routeData.path.startsWith('/page/')) {
      main.innerHTML = this.renderContentPage(routeData);
    } else {
      main.innerHTML = this.renderGenericPage(routeData);
    }
  }

  renderHomePage() {
    return `
      <section class="hero">
        <h1>Vova & Petrova</h1>
        <p>База знаний и истории проекта</p>
      </section>
      <section class="quick-nav">
        <h2>Быстрая навигация</h2>
        <div class="nav-grid" id="quick-nav-grid"></div>
      </section>
    `;
  }

  renderKBPage() {
    return `
      <section class="kb-page">
        <h1>База знаний</h1>
        <div class="kb-list" id="kb-list">
          <p class="loading">Загрузка...</p>
        </div>
      </section>
    `;
  }

  renderPortfolioPage() {
    return `
      <section class="portfolio-page">
        <h1>Портфолио и услуги</h1>
        <p>Кейсы и услуги будут здесь</p>
      </section>
    `;
  }

  renderContentPage(routeData) {
    return `
      <article class="content-page">
        <h1>${this.escapeHtml(routeData.title)}</h1>
        <p class="description">${this.escapeHtml(routeData.og?.description || '')}</p>
        <div class="content">
          <p>Контент страницы будет загружен здесь</p>
        </div>
      </article>
    `;
  }

  renderGenericPage(routeData) {
    return `
      <section class="generic-page">
        <h1>${this.escapeHtml(routeData.title)}</h1>
        <p class="description">${this.escapeHtml(routeData.og?.description || '')}</p>
      </section>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  navigate(path) {
    window.location.hash = path;
  }
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}
