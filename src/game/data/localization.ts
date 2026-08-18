export type Language = 'ru' | 'en';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ru: {
    app_title: 'Садовая мастерская',
    play: 'Играть',
    garden: 'Сад',
    workshop: 'Мастерская',
    settings: 'Настройки',
    how_to_play: 'Как играть',
    pause: 'Пауза',
    resume: 'Продолжить',
    restart: 'Сброс прогресса',
    sound: 'Звуки',
    vibration: 'Вибрация',
    language: 'Язык',
    coins: 'Монеты',
    orders_title: 'Заказы садоводов',
    complete_order: 'Сдать',
    order_ready: 'Готов!',
    seed_basket: 'Корзина семян',
    free_taps: 'Бесплатно: {count}',
    buy_seed: 'Семечко за {cost}',
    need_space: 'Поле заполнено!',
    overflow_title: 'Нет свободного места',
    overflow_desc: 'На доске не осталось места для новых семян.',
    rewarded_clean_lowest: 'Удалить слабое семечко (Реклама)',
    rewarded_extra_seed: 'Получить семечко (Реклама)',
    close: 'Закрыть',
    upgrade: 'Улучшить ({cost})',
    max_level: 'Макс. уровень',
    garden_title: 'Восстановление сада',
    
    // Tutorial
    tut_step1_title: 'Добро пожаловать в Садовую мастерскую!',
    tut_step1_desc: 'Нажмите на Корзину с семенами, чтобы получить первое семечко.',
    tut_step2_title: 'Объединяйте одинаковые предметы',
    tut_step2_desc: 'Перетащите одно семечко на другое, чтобы вырастить росток!',
    tut_step3_title: 'Выполняйте заказы',
    tut_step3_desc: 'Выращивайте нужные растения и получайте монеты от жителей.',
    tut_step4_title: 'Украшайте свой сад',
    tut_step4_desc: 'Тратьте заработанные монеты во вкладке «Сад» и восстановите парк!',
    tut_got_it: 'Понятно!',

    // Items
    item_seed_1: 'Семечко',
    item_seed_1_desc: 'Уровень 1. Начало новой жизни.',
    item_sprout_2: 'Зелёный росток',
    item_sprout_2_desc: 'Уровень 2. Нежный молодой побег.',
    item_flower_3: 'Садовый цветок',
    item_flower_3_desc: 'Уровень 3. Яркий солнечный бутон.',
    item_bush_4: 'Пышный кустарник',
    item_bush_4_desc: 'Уровень 4. Аккуратная живая изгородь.',
    item_tree_5: 'Плодовое дерево',
    item_tree_5_desc: 'Уровень 5. Крепкое дерево с густой кроной.',
    item_orchid_6: 'Редкая орхидея',
    item_orchid_6_desc: 'Уровень 6. Изысканный тропический цветок.',
    item_rose_arch_7: 'Арка из роз',
    item_rose_arch_7_desc: 'Уровень 7. Праздничная цветочная арка.',
    item_pond_8: 'Декоративный пруд',
    item_pond_8_desc: 'Уровень 8. Живописный водоём с кувшинками.',

    // Garden plots
    plot_flower_bed: 'Цветочная клумба',
    plot_stone_path: 'Каменная дорожка',
    plot_water_fountain: 'Мраморный фонтан',
    plot_gazebo: 'Уютная беседка',
  },
  en: {
    app_title: 'Garden Workshop',
    play: 'Play',
    garden: 'Garden',
    workshop: 'Workshop',
    settings: 'Settings',
    how_to_play: 'How to Play',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Reset Progress',
    sound: 'Sound',
    vibration: 'Vibration',
    language: 'Language',
    coins: 'Coins',
    orders_title: 'Customer Orders',
    complete_order: 'Deliver',
    order_ready: 'Ready!',
    seed_basket: 'Seed Basket',
    free_taps: 'Free: {count}',
    buy_seed: 'Seed for {cost}',
    need_space: 'Board is full!',
    overflow_title: 'Board is Full',
    overflow_desc: 'No free cells remaining on the field.',
    rewarded_clean_lowest: 'Remove lowest item (Ad)',
    rewarded_extra_seed: 'Get free seed (Ad)',
    close: 'Close',
    upgrade: 'Upgrade ({cost})',
    max_level: 'Max Level',
    garden_title: 'Garden Restoration',
    
    // Tutorial
    tut_step1_title: 'Welcome to Garden Workshop!',
    tut_step1_desc: 'Tap the Seed Basket to spawn your first seed.',
    tut_step2_title: 'Merge matching items',
    tut_step2_desc: 'Drag one seed onto another to grow a green sprout!',
    tut_step3_title: 'Complete orders',
    tut_step3_desc: 'Grow plants requested by villagers to earn gold coins.',
    tut_step4_title: 'Restore your garden',
    tut_step4_desc: 'Spend your coins in the Garden tab to restore the park!',
    tut_got_it: 'Got it!',

    // Items
    item_seed_1: 'Seed',
    item_seed_1_desc: 'Level 1. The beginning of life.',
    item_sprout_2: 'Green Sprout',
    item_sprout_2_desc: 'Level 2. Fresh young shoot.',
    item_flower_3: 'Garden Flower',
    item_flower_3_desc: 'Level 3. Bright sunny blossom.',
    item_bush_4: 'Lush Bush',
    item_bush_4_desc: 'Level 4. Neatly trimmed hedge.',
    item_tree_5: 'Fruit Tree',
    item_tree_5_desc: 'Level 5. Sturdy tree with rich crown.',
    item_orchid_6: 'Rare Orchid',
    item_orchid_6_desc: 'Level 6. Elegant exotic orchid.',
    item_rose_arch_7: 'Rose Arch',
    item_rose_arch_7_desc: 'Level 7. Festive flower arch.',
    item_pond_8: 'Water Pond',
    item_pond_8_desc: 'Level 8. Picturesque garden pond with lilies.',

    // Garden plots
    plot_flower_bed: 'Flower Bed',
    plot_stone_path: 'Stone Pathway',
    plot_water_fountain: 'Marble Fountain',
    plot_gazebo: 'Cozy Gazebo',
  },
};

let currentLang: Language = 'ru';

export function setLanguage(lang: Language): void {
  currentLang = lang;
}

export function getLanguage(): Language {
  return currentLang;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.ru;
  let text = dict[key] || TRANSLATIONS.en[key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}
