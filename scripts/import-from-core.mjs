#!/usr/bin/env node
/**
 * Импорт данных из vovaipetrova-core
 * 
 * Копирует content slices и static контракт из core репозитория
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Проверяем разные возможные пути к core
const possibleCorePaths = [
  join(__dirname, '../../vovaipetrova-core'),  // Локальная разработка
  join(process.cwd(), '../vovaipetrova-core'), // CI (рядом с site)
];

let CORE_DIR = null;
for (const path of possibleCorePaths) {
  if (existsSync(path)) {
    CORE_DIR = path;
    break;
  }
}

if (!CORE_DIR) {
  // Пробуем найти через переменную окружения
  CORE_DIR = process.env.CORE_DIR || possibleCorePaths[0];
}

const DATA_DIR = join(__dirname, '../data');

const FILES_TO_COPY = [
  { src: 'kb_glossary_lite.jsonl', dst: 'kb_glossary_lite.jsonl' },
  { src: 'prototype/data/stories_digests.jsonl', dst: 'stories_digests.jsonl' },
  { src: 'static/routes.json', dst: 'routes.json' },
  { src: 'static/tokens.json', dst: 'tokens.json' },
  { src: 'static/components.md', dst: 'components.md' },
];

function log(message) {
  console.log(`[import] ${message}`);
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function main() {
  log('Импорт данных из vovaipetrova-core...\n');

  if (!CORE_DIR || !existsSync(CORE_DIR)) {
    log(`❌ Репозиторий core не найден`);
    log(`   Проверенные пути:`);
    possibleCorePaths.forEach(p => log(`   - ${p}`));
    log(`   Убедитесь, что vovaipetrova-core находится рядом с vovaipetrova-site`);
    log(`   Или установите переменную окружения CORE_DIR`);
    process.exit(1);
  }

  log(`📁 Используется core из: ${CORE_DIR}`);

  ensureDir(DATA_DIR);

  let copied = 0;
  let skipped = 0;

  for (const { src, dst } of FILES_TO_COPY) {
    const srcPath = join(CORE_DIR, src);
    const dstPath = join(DATA_DIR, dst);

    if (!existsSync(srcPath)) {
      log(`⚠️  Файл не найден: ${src}`);
      skipped++;
      continue;
    }

    try {
      copyFileSync(srcPath, dstPath);
      log(`✅ Скопирован: ${dst}`);
      copied++;
    } catch (error) {
      log(`❌ Ошибка копирования ${src}: ${error.message}`);
      skipped++;
    }
  }

  log(`\nИмпорт завершён: ${copied} файлов скопировано, ${skipped} пропущено`);
  
  // Проверяем наличие обязательных файлов
  const required = ['routes.json', 'tokens.json'];
  const missing = required.filter(file => !existsSync(join(DATA_DIR, file)));
  
  if (missing.length > 0) {
    log(`\n⚠️  Отсутствуют обязательные файлы: ${missing.join(', ')}`);
    log(`   Запустите в core: npm run content:slices && npm run static:routes:generate`);
  }
}

main();
