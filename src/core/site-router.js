/**
 * Роутер для сайта (витрины)
 * 
 * Работает с независимой структурой сайта из site-structure.json
 * Не зависит от структуры ядра
 */

class SiteRouter {
  constructor(siteStructure) {
    this.structure = siteStructure;
    this.currentRoute = '/';
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  async handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    this.currentRoute = hash;
    await this.showPage(hash);
  }

  async showPage(route) {
    const page = this.structure.site.pages[route];
    
    if (!page) {
      this.showPage('/');
      return;
    }

    document.title = `${page.title} — ${this.structure.site.name}`;
    this.renderPage(page, route);
    
    // Загружаем контент после рендеринга
    setTimeout(async () => {
      await this.loadPageContent(route);
    }, 100);
  }

  renderPage(page, route) {
    const main = document.querySelector('main');
    if (!main) return;

    let html = '';

    // Breadcrumbs
    html += this.renderBreadcrumbs(route);

    // Контент страницы в зависимости от типа
    switch (page.type) {
      case 'home':
        html += this.renderHomePage(page);
        break;
      case 'section':
        // Если это раздел KB или Stories, используем специальный рендеринг
        if (route === '/kb') {
          html += this.renderKBPage(page, route);
        } else if (route === '/stories') {
          html += this.renderStoriesPage(page, route);
        } else {
          html += this.renderSectionPage(page, route);
        }
        break;
      case 'subsection':
        html += this.renderSubsectionPage(page, route);
        break;
      case 'service':
        html += this.renderServicePage(page, route);
        break;
      default:
        html += this.renderGenericPage(page);
    }

    main.innerHTML = html;
  }

  renderBreadcrumbs(route) {
    const page = this.structure.site.pages[route];
    if (!page || route === '/') return '';

    const crumbs = [{ path: '/', title: 'Главная' }];
    
    if (page.parent) {
      const parent = this.structure.site.pages[page.parent];
      if (parent) {
        crumbs.push({ path: page.parent, title: parent.title });
      }
    }
    
    crumbs.push({ path: route, title: page.title });

    const breadcrumbsHTML = crumbs.map((crumb, index) => {
      const isLast = index === crumbs.length - 1;
      const path = crumb.path === '/' ? '#' : `#${crumb.path}`;
      
      if (isLast) {
        return `<span class="breadcrumb-current">${this.escapeHtml(crumb.title)}</span>`;
      }
      
      return `
        <a href="${path}" class="breadcrumb-link">${this.escapeHtml(crumb.title)}</a>
        <span class="breadcrumb-separator"> › </span>
      `;
    }).join('');

    return `<nav class="breadcrumbs">${breadcrumbsHTML}</nav>`;
  }

  renderKBPage(page, route) {
    return `
      <section class="kb-page">
        <h1>${this.escapeHtml(page.title)}</h1>
        ${page.description ? `<p class="section-description">${this.escapeHtml(page.description)}</p>` : ''}
        <div class="kb-list" id="kb-list">
          <p class="loading">Загрузка...</p>
        </div>
      </section>
    `;
  }

  renderKBPage(page, route) {
    return `
      <section class="kb-page">
        <h1>${this.escapeHtml(page.title)}</h1>
        ${page.description ? `<p class="section-description">${this.escapeHtml(page.description)}</p>` : ''}
        <div class="kb-list" id="kb-list">
          <p class="loading">Загрузка...</p>
        </div>
      </section>
    `;
  }

  renderHomePage(page) {
    return `
      <section class="hero">
        <h1>${this.escapeHtml(page.sections.find(s => s.type === 'hero')?.title || 'Vova & Petrova')}</h1>
        <p class="hero-subtitle">${this.escapeHtml(page.sections.find(s => s.type === 'hero')?.subtitle || '')}</p>
      </section>
      
      <section class="services-preview">
        <h2>Наши услуги</h2>
        <div class="services-grid" id="services-grid"></div>
      </section>
      
      <section class="portfolio-preview">
        <h2>Портфолио</h2>
        <div class="portfolio-grid" id="portfolio-grid"></div>
      </section>
    `;
  }

  // Метод для загрузки контента после рендеринга страницы
  async loadPageContent(route) {
    const page = this.structure.site.pages[route];
    if (!page) return;

    // Загружаем контент в зависимости от типа страницы
    if (typeof ContentLoader !== 'undefined') {
      const contentLoader = new ContentLoader();

      if (route === '/') {
        // Главная страница
        await contentLoader.renderServicesPreview('services-grid');
        await contentLoader.renderPortfolioPreview('portfolio-grid');
      } else if (route === '/kb') {
        // База знаний
        await contentLoader.renderKBList('kb-list');
      } else if (route === '/stories') {
        // Stories
        await contentLoader.renderStoriesList('stories-list');
      }
    }
  }

  renderSectionPage(page, route) {
    // Находим подразделы для этого раздела
    const menuItem = this.structure.site.menu.find(m => m.path === route);
    const submenu = menuItem?.submenu || [];

    let html = `
      <section class="section-page">
        <h1>${this.escapeHtml(page.title)}</h1>
        ${page.description ? `<p class="section-description">${this.escapeHtml(page.description)}</p>` : ''}
    `;

    if (submenu.length > 0) {
      html += '<div class="subsections-grid">';
      submenu.forEach(sub => {
        html += `
          <div class="subsection-card" data-route="${sub.path}">
            <h3>${this.escapeHtml(sub.title)}</h3>
            <a href="#${sub.path}" class="subsection-link">Перейти →</a>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</section>';
    return html;
  }

  renderStoriesPage(page, route) {
    return `
      <section class="stories-page">
        <h1>${this.escapeHtml(page.title)}</h1>
        ${page.description ? `<p class="section-description">${this.escapeHtml(page.description)}</p>` : ''}
        <div class="stories-list" id="stories-list">
          <p class="loading">Загрузка...</p>
        </div>
      </section>
    `;
  }

  renderStoriesPage(page, route) {
    return `
      <section class="stories-page">
        <h1>${this.escapeHtml(page.title)}</h1>
        ${page.description ? `<p class="section-description">${this.escapeHtml(page.description)}</p>` : ''}
        <div class="stories-list" id="stories-list">
          <p class="loading">Загрузка...</p>
        </div>
      </section>
    `;
  }

  renderSubsectionPage(page, route) {
    return `
      <section class="subsection-page">
        <h1>${this.escapeHtml(page.title)}</h1>
        <p>Контент подраздела будет здесь</p>
      </section>
    `;
  }

  renderServicePage(page, route) {
    return `
      <section class="service-page">
        <h1>${this.escapeHtml(page.title)}</h1>
        <p>Описание услуги будет здесь</p>
      </section>
    `;
  }

  renderGenericPage(page) {
    return `
      <section class="generic-page">
        <h1>${this.escapeHtml(page.title)}</h1>
        ${page.description ? `<p>${this.escapeHtml(page.description)}</p>` : ''}
      </section>
    `;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  navigate(path) {
    window.location.hash = path;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SiteRouter;
}
