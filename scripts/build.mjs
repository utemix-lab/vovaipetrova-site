#!/usr/bin/env node
/**
 * Сборка статического сайта
 * 
 * Генерирует HTML файлы из данных и шаблонов
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../data');
const DIST_DIR = join(__dirname, '../dist');
const LAYOUTS_DIR = join(__dirname, '../src/layouts');
const STYLES_DIR = join(__dirname, '../src/styles');

function log(message) {
  console.log(`[build] ${message}`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadJSON(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function loadText(filePath) {
  if (!existsSync(filePath)) {
    return '';
  }
  return readFileSync(filePath, 'utf8');
}

function loadTemplate(name) {
  const templatePath = join(LAYOUTS_DIR, `${name}.html`);
  if (!existsSync(templatePath)) {
    return null;
  }
  return readFileSync(templatePath, 'utf8');
}

function main() {
  log('Сборка статического сайта...\n');

  ensureDir(DIST_DIR);

  // Загружаем данные
  const routes = loadJSON(join(DATA_DIR, 'routes.json'));
  const tokens = loadJSON(join(DATA_DIR, 'tokens.json'));
  
  if (!routes || !tokens) {
    log('❌ Отсутствуют обязательные данные. Запустите: npm run import');
    process.exit(1);
  }

  // Копируем стили
  const styles = loadText(join(STYLES_DIR, 'main.css'));
  if (styles) {
    writeFileSync(join(DIST_DIR, 'styles.css'), styles);
    log('✅ Стили скопированы');
  }
  
  const siteStyles = loadText(join(STYLES_DIR, 'site.css'));
  if (siteStyles) {
    writeFileSync(join(DIST_DIR, 'site.css'), siteStyles);
    log('✅ Стили сайта скопированы');
  }

  // Копируем данные в dist/data для загрузки через fetch
  const distDataDir = join(DIST_DIR, 'data');
  ensureDir(distDataDir);
  
  const dataFiles = ['kb_glossary_lite.jsonl', 'stories_digests.jsonl', 'routes.json', 'tokens.json'];
  for (const file of dataFiles) {
    const srcPath = join(DATA_DIR, file);
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, join(distDataDir, file));
    }
  }
  log('✅ Данные скопированы в dist/data');

  // Копируем core компоненты
  const coreDir = join(__dirname, '../src/core');
  const distCoreDir = join(DIST_DIR, 'core');
  if (existsSync(coreDir)) {
    ensureDir(distCoreDir);
    const coreFiles = ['router.js', 'navigation.js', 'site-router.js', 'site-navigation.js'];
    for (const file of coreFiles) {
      const srcPath = join(coreDir, file);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, join(distCoreDir, file));
      }
    }
    log('✅ Core компоненты скопированы');
  }

  // Копируем конфигурацию сайта
  const configDir = join(__dirname, '../src/config');
  const distConfigDir = join(DIST_DIR, 'config');
  if (existsSync(configDir)) {
    ensureDir(distConfigDir);
    const configFiles = ['site-structure.json'];
    for (const file of configFiles) {
      const srcPath = join(configDir, file);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, join(distConfigDir, file));
      }
    }
    log('✅ Конфигурация сайта скопирована');
  }

  // Генерируем главную страницу (используем новый шаблон site.html)
  const siteTemplate = loadTemplate('site');
  if (siteTemplate) {
    writeFileSync(join(DIST_DIR, 'index.html'), siteTemplate);
    log('✅ Главная страница сгенерирована (site.html)');
  } else {
    // Fallback на старый шаблон
    const indexTemplate = loadTemplate('index');
    if (indexTemplate) {
      const indexHTML = indexTemplate
        .replace('{{ROUTES}}', JSON.stringify(routes, null, 2))
        .replace('{{TOKENS}}', JSON.stringify(tokens, null, 2));
      
      writeFileSync(join(DIST_DIR, 'index.html'), indexHTML);
      log('✅ Главная страница сгенерирована (index.html fallback)');
    } else {
      // Создаём минимальную главную страницу
    const minimalIndex = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vova & Petrova</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>Vova & Petrova</h1>
      <p>Статический сайт с контентом из базы знаний</p>
    </header>
    <main>
      <section id="routes">
        <h2>Маршруты</h2>
        <pre id="routes-data"></pre>
      </section>
    </main>
  </div>
  <script>
    const routes = ${JSON.stringify(routes, null, 2)};
    document.getElementById('routes-data').textContent = JSON.stringify(routes, null, 2);
  </script>
</body>
</html>`;
    
      writeFileSync(join(DIST_DIR, 'index.html'), minimalIndex);
      log('✅ Минимальная главная страница создана');
    }
  }

  log('\n✅ Сборка завершена');
}

main();
