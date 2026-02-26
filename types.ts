
export enum WidgetType {
  NUMBER_LINE = 'NUMBER_LINE',
  RULER = 'RULER',
  PROTRACTOR = 'PROTRACTOR',
  FRACTION = 'FRACTION',
  COORDINATES = 'COORDINATES',
  PROBABILITY = 'PROBABILITY',
  NUMBER_OF_DAY = 'NUMBER_OF_DAY',
  EQUATION = 'EQUATION',
  FORMULAS = 'FORMULAS',
  CALCULATOR = 'CALCULATOR',
  PERCENTAGE = 'PERCENTAGE',
  BASE_10 = 'BASE_10',
  HUNDRED_CHART = 'HUNDRED_CHART',
  NUMBER_HOUSE = 'NUMBER_HOUSE',
  NUMBER_BEADS = 'NUMBER_BEADS',
  SHAPES = 'SHAPES',
  FRACTION_BARS = 'FRACTION_BARS',
  MATH_WORKSHOP = 'MATH_WORKSHOP',
  PRIME_BUBBLES = 'PRIME_BUBBLES',
  CHANCE_GENERATOR = 'CHANCE_GENERATOR',
  CLOCK = 'CLOCK',
  ECONOMY = 'ECONOMY',
  MULTI_MATCH = 'MULTI_MATCH',
  TIERED_TASK = 'TIERED_TASK',
}

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  zIndex: number;
  width?: number;
  height?: number;
}

export interface WidgetProps {
  id: string;
}

export type BackgroundType = 'GRID' | 'DOTS' | 'WHITE' | 'BLACK';

export interface BackgroundConfig {
  type: BackgroundType;
  label: string;
  className: string;
}
