import type { GardenPlot } from '../../types/game';

export const INITIAL_GARDEN_PLOTS: GardenPlot[] = [
  {
    id: 'flower_bed',
    nameKey: 'plot_flower_bed',
    level: 0,
    maxLevel: 3,
    upgradeCosts: [20, 50, 120],
  },
  {
    id: 'stone_path',
    nameKey: 'plot_stone_path',
    level: 0,
    maxLevel: 3,
    upgradeCosts: [35, 80, 180],
  },
  {
    id: 'water_fountain',
    nameKey: 'plot_water_fountain',
    level: 0,
    maxLevel: 3,
    upgradeCosts: [60, 150, 300],
  },
  {
    id: 'gazebo',
    nameKey: 'plot_gazebo',
    level: 0,
    maxLevel: 3,
    upgradeCosts: [100, 250, 500],
  },
];
