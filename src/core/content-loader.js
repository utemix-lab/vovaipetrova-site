/**
 * Загрузчик контента для разделов сайта
 * 
 * Загружает контент из данных core и отображает в разделах сайта
 */

class ContentLoader {
  constructor() {
    this.kbData = null;
    this.storiesData = null;
  }

  /**
   * Загружает данные KB glossary
   */
  async loadKB() {
    if (this.kbData) return this.kbData;

    try {
      const response = await fetch('./data/kb_glossary_lite.jsonl');
      if (!response.ok) {
        throw new Error('Не удалось загрузить KB glossary');
      }
      const text = await response.text();
      const lines = text.trim().split('\n').filter(Boolean);
      this.kbData = lines.map(line => JSON.parse(line));
      return this.kbData;
    } catch (error) {
      console.error('Ошибка загрузки KB:', error);
      return [];
    }
  }

  /**
   * Загружает данные Stories digests
   */
  async loadStories() {
    if (this.storiesData) return this.storiesData;

    try {
      const response = await fetch('./data/stories_digests.jsonl');
      if (!response.ok) {
        throw new Error('Не удалось загрузить Stories digests');
      }
      const text = await response.text();
      const lines = text.trim().split('\n').filter(Boolean);
      this.storiesData = lines.map(line => JSON.parse(line));
      return this.storiesData;
    } catch (error) {
      console.error('Ошибка загрузки Stories:', error);
      return [];
    }
  }

  /**
   * Рендерит список терминов KB
   */
  async renderKBList(containerId, limit = 20) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p class="loading">Загрузка...</p>';

    const kbData = await this.loadKB();
    if (kbData.length === 0) {
      container.innerHTML = '<p class="error">Термины не найдены</p>';
      return;
    }

    const items = kbData.slice(0, limit).map(item => `
      <div class="kb-item">
        <h4><a href="#/kb/articles/${this.escapeHtml(item.slug)}">${this.escapeHtml(item.title)}</a></h4>
        <p>${this.escapeHtml(item.lite_summary || '')}</p>
      </div>
    `).join('');

    container.innerHTML = items;
  }

  /**
   * Рендерит список Stories
   */
  async renderStoriesList(containerId, limit = 10) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p class="loading">Загрузка...</p>';

    const storiesData = await this.loadStories();
    if (storiesData.length === 0) {
      container.innerHTML = '<p class="error">Stories не найдены</p>';
      return;
    }

    const items = storiesData.slice(0, limit).map(item => `
      <div class="story-item">
        <h4><a href="#/stories/${this.escapeHtml(item.slug)}">${this.escapeHtml(item.title)}</a></h4>
        <p>Эпизодов: ${item.episodes ? item.episodes.length : 0}</p>
        ${item.generated_at ? `<p class="story-date">${new Date(item.generated_at).toLocaleDateString('ru-RU')}</p>` : ''}
      </div>
    `).join('');

    container.innerHTML = items;
  }

  /**
   * Рендерит превью услуг для главной страницы
   */
  async renderServicesPreview(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const services = [
      { id: 'video', title: 'Видеопродакшн', description: 'Создание видео контента' },
      { id: 'design', title: 'Дизайн', description: 'Графический дизайн и айдентика' },
      { id: 'engineering', title: 'Проектирование', description: 'CAD/3D проектирование' },
      { id: 'automation', title: 'Автоматизация', description: 'Автоматизация процессов' }
    ];

    const items = services.map(service => `
      <div class="service-card">
        <h3>${this.escapeHtml(service.title)}</h3>
        <p>${this.escapeHtml(service.description)}</p>
        <a href="#/services/${service.id}" class="service-link">Подробнее →</a>
      </div>
    `).join('');

    container.innerHTML = items;
  }

  /**
   * Рендерит превью портфолио для главной страницы
   */
  async renderPortfolioPreview(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="portfolio-preview-text">
        <p>Наши работы и кейсы будут здесь</p>
        <a href="#/portfolio" class="portfolio-link">Смотреть портфолио →</a>
      </div>
    `;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentLoader;
}
