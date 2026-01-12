# vovaipetrova-site

Статический сайт для публикации контента из базы знаний Vova & Petrova.

## Описание

Этот репозиторий содержит статический сайт, который получает данные из [vovaipetrova-core](../vovaipetrova-core) и публикует их на GitHub Pages.

## Структура

```
vovaipetrova-site/
├── data/              # Импортированные данные из core
├── dist/              # Собранный сайт (для деплоя)
├── src/
│   ├── layouts/       # HTML шаблоны
│   ├── styles/        # CSS стили
│   └── components/    # UI компоненты
└── scripts/
    ├── import-from-core.mjs  # Импорт данных
    └── build.mjs             # Сборка сайта
```

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Импорт данных из core

```bash
npm run import
```

Этот скрипт копирует необходимые файлы из `vovaipetrova-core`:
- `kb_glossary_lite.jsonl` - термины базы знаний
- `stories_digests.jsonl` - дайджесты Stories
- `routes.json` - маршруты сайта
- `tokens.json` - дизайн-токены
- `components.md` - описание компонентов

### 3. Сборка сайта

```bash
npm run build
```

Собранный сайт будет в папке `dist/`.

### 4. Локальный просмотр

Откройте `dist/index.html` в браузере или используйте простой HTTP-сервер:

```bash
cd dist && python -m http.server 8000
```

Затем откройте http://localhost:8000

## Деплой

Сайт автоматически деплоится на GitHub Pages при пуше в `main` ветку через GitHub Actions workflow.

## Разработка

### Скрипты

- `npm run import` - импорт данных из core
- `npm run build` - сборка статического сайта
- `npm run deploy` - импорт + сборка (для CI)

### Данные

Данные импортируются из `vovaipetrova-core`:
- Content slices (JSONL файлы)
- Static контракт (routes, tokens, components)
- Только контент со статусом `ready`

## Связанные репозитории

- [vovaipetrova-core](../vovaipetrova-core) - источник данных (Think Tank)
