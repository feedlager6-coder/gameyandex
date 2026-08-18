import type { ItemConfig, ItemId } from '../../types/game';

export const ITEMS: ItemConfig[] = [
  {
    id: 'seed_1',
    level: 1,
    nameKey: 'item_seed_1',
    descKey: 'item_seed_1_desc',
    color: 0x8d6e63,
    badgeColor: 0x6d4c41,
    iconType: 'seed',
    sellValue: 1,
    nextItemId: 'sprout_2',
  },
  {
    id: 'sprout_2',
    level: 2,
    nameKey: 'item_sprout_2',
    descKey: 'item_sprout_2_desc',
    color: 0x81c784,
    badgeColor: 0x4caf50,
    iconType: 'sprout',
    sellValue: 2,
    nextItemId: 'flower_3',
  },
  {
    id: 'flower_3',
    level: 3,
    nameKey: 'item_flower_3',
    descKey: 'item_flower_3_desc',
    color: 0xffb74d,
    badgeColor: 0xf57c00,
    iconType: 'flower',
    sellValue: 5,
    nextItemId: 'bush_4',
  },
  {
    id: 'bush_4',
    level: 4,
    nameKey: 'item_bush_4',
    descKey: 'item_bush_4_desc',
    color: 0x4db6ac,
    badgeColor: 0x00897b,
    iconType: 'bush',
    sellValue: 12,
    nextItemId: 'tree_5',
  },
  {
    id: 'tree_5',
    level: 5,
    nameKey: 'item_tree_5',
    descKey: 'item_tree_5_desc',
    color: 0x66bb6a,
    badgeColor: 0x2e7d32,
    iconType: 'tree',
    sellValue: 28,
    nextItemId: 'orchid_6',
  },
  {
    id: 'orchid_6',
    level: 6,
    nameKey: 'item_orchid_6',
    descKey: 'item_orchid_6_desc',
    color: 0xba68c8,
    badgeColor: 0x7b1fa2,
    iconType: 'orchid',
    sellValue: 65,
    nextItemId: 'rose_arch_7',
  },
  {
    id: 'rose_arch_7',
    level: 7,
    nameKey: 'item_rose_arch_7',
    descKey: 'item_rose_arch_7_desc',
    color: 0xe57373,
    badgeColor: 0xc62828,
    iconType: 'rose_arch',
    sellValue: 150,
    nextItemId: 'pond_8',
  },
  {
    id: 'pond_8',
    level: 8,
    nameKey: 'item_pond_8',
    descKey: 'item_pond_8_desc',
    color: 0x4fc3f7,
    badgeColor: 0x0288d1,
    iconType: 'pond',
    sellValue: 350,
    nextItemId: null,
  },
];

export const ITEMS_BY_ID: Record<ItemId, ItemConfig> = ITEMS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {} as Record<ItemId, ItemConfig>);

export const MAX_ITEM_LEVEL = 8;
