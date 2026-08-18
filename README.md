# Садовая мастерская (Garden Workshop) — Mobile-First Merge Puzzle

Оригинальная 2D merge-головоломка в портретной ориентации для мобильных устройств и десктопов. Оптимизирована для размещения на платформе **Яндекс Игры**.

## Стек технологий
- **TypeScript** (Strict Mode, no `any`)
- **Phaser 3** (2D Canvas/WebGL Game Engine)
- **Vite** (Быстрый бандлер и dev-сервер)
- **Web Audio API** (Процедурные звуковые эффекты без внешних тяжелых аудиофайлов)
- **Yandex Games SDK v2** (Player Cloud Save, Rewarded Video, Interstitial, LoadingAPI.ready, GameplayAPI)

## Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск локального сервера разработки
```bash
npm run dev
```
По умолчанию игра запустится на `http://localhost:3000` в автономном режиме с `MockPlatformAdapter`.

### 3. Сборка для публикации (Production Build)
```bash
npm run build
```
Готовые файлы для загрузки в консоль разработчика Яндекс Игр будут сформированы в директории `/dist` с `index.html` в корне.

### 4. Проверка типов и линтинг
```bash
npm run lint
```

## Архитектура
- `src/types/` — строгие типы данных: `ItemId`, `BoardCell`, `Order`, `SaveData`, `IPlatformAdapter`.
- `src/integrations/` — платформенные адаптеры (`MockPlatformAdapter`, `YandexPlatformAdapter`, фабрика `getPlatformAdapter`).
- `src/game/data/` — конфигурация 8 уровней предметов, словарь локализации (RU/EN), улучшения сада.
- `src/game/systems/` — менеджер сохранений `SaveManager` (localStorage + Cloud Debounce + visibilitychange), `SoundSystem` (Web Audio), `AssetGenerator` (векторные Canvas-текстуры).
- `src/game/scenes/` — сцены `BootScene`, `MainMenuScene` (с вызовом `platform.loadingReady()`), `GameScene` (6x6 доска, drag-and-drop, merge), `GardenScene` (восстановление парка).
- `src/game/ui/` — модальные окна `ModalManager` (Пауза, Настройки звука, Обучение, Вознаграждаемая реклама при переполнении).
