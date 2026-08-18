export type ItemId =
  | 'seed_1'
  | 'sprout_2'
  | 'flower_3'
  | 'bush_4'
  | 'tree_5'
  | 'orchid_6'
  | 'rose_arch_7'
  | 'pond_8';

export interface ItemConfig {
  id: ItemId;
  level: number; // 1..8
  nameKey: string;
  descKey: string;
  color: number;
  badgeColor: number;
  iconType: string;
  sellValue: number;
  nextItemId: ItemId | null;
}

export interface BoardCell {
  row: number; // 0..5
  col: number; // 0..5
  itemId: ItemId | null;
}

export interface Order {
  id: string;
  requiredItemId: ItemId;
  rewardCoins: number;
  rewardExp: number;
}

export interface GardenPlot {
  id: 'flower_bed' | 'stone_path' | 'water_fountain' | 'gazebo';
  nameKey: string;
  level: number; // 0 = broken/empty, 1..3 = upgraded
  maxLevel: number;
  upgradeCosts: number[]; // cost for [lvl1, lvl2, lvl3]
}
