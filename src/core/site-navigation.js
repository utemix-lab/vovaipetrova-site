/**
 * Навигация сайта (витрины)
 * 
 * Работает с независимой структурой сайта из site-structure.json
 * Классическое меню с разделами и подразделами
 */

class SiteNavigation {
  constructor(siteStructure) {
    this.structure = siteStructure;
  }

  /**
   * Рендерит главное меню в header
   */
  renderMainMenu(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const menuHTML = this.structure.site.menu.map(item => {
      const path = item.path === '/' ? '#' : `#${item.path}`;
      const isActive = this.isRouteActive(item.path);
      
      let html = `
        <div class="menu-item ${isActive ? 'active' : ''}" data-path="${item.path}">
          <a href="${path}" class="menu-link">${this.escapeHtml(item.title)}</a>
      `;

      // Подменю (если есть)
      if (item.submenu && item.submenu.length > 0) {
        html += '<div class="submenu">';
        item.submenu.forEach(sub => {
          html += `
            <a href="#${sub.path}" class="submenu-link">${this.escapeHtml(sub.title)}</a>
          `;
        });
        html += '</div>';
      }

      html += '</div>';
      return html;
    }).join('');

    container.innerHTML = menuHTML;

    // Обработчики кликов
    container.querySelectorAll('.menu-link, .submenu-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          window.location.hash = href.slice(1);
        }
      });
    });
  }

  /**
   * Рендерит боковое меню (sidebar) для текущего раздела
   */
  renderSidebar(containerId, currentRoute) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Находим текущий раздел
    const menuItem = this.structure.site.menu.find(m => 
      currentRoute.startsWith(m.path) && m.path !== '/'
    );

    if (!menuItem || !menuItem.submenu || menuItem.submenu.length === 0) {
      container.innerHTML = '';
      return;
    }

    const sidebarHTML = `
      <nav class="sidebar">
        <h3 class="sidebar-title">${this.escapeHtml(menuItem.title)}</h3>
        <ul class="sidebar-menu">
          ${menuItem.submenu.map(sub => {
            const isActive = currentRoute === sub.path;
            return `
              <li class="sidebar-item ${isActive ? 'active' : ''}">
                <a href="#${sub.path}" class="sidebar-link">${this.escapeHtml(sub.title)}</a>
              </li>
            `;
          }).join('')}
        </ul>
      </nav>
    `;

    container.innerHTML = sidebarHTML;

    // Обработчики кликов
    container.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          window.location.hash = href.slice(1);
        }
      });
    });
  }

  /**
   * Проверяет, активен ли маршрут
   */
  isRouteActive(path) {
    const currentHash = window.location.hash.slice(1) || '/';
    return currentHash === path || currentHash.startsWith(path + '/');
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SiteNavigation;
}
