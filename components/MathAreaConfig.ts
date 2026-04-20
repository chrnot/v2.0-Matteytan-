import { MathArea, WidgetType, Difficulty } from '../types';
import { Icons } from './icons';

export interface MathAreaConfig {
  id: MathArea;
  label: string;
  icon: any;
  description: string;
}

export const MATH_AREAS: MathAreaConfig[] = [
  {
    id: MathArea.TAL,
    label: 'Taluppfattning och tals användning',
    icon: Icons.Hash,
    description: 'Förståelse för talens värde och de fyra räknesätten.',
  },
  {
    id: MathArea.ALGEBRA,
    label: 'Algebra',
    icon: Icons.Sigma,
    description: 'Från specifika tal till generella mönster och variabler.',
  },
  {
    id: MathArea.GEOMETRI,
    label: 'Geometri',
    icon: Icons.Shapes,
    description: 'Former, rumsuppfattning och mätandets principer.',
  },
  {
    id: MathArea.STATISTIK,
    label: 'Sannolikhet och statistik',
    icon: Icons.BarChart2,
    description: 'Tolka data, se samband och förstå slump.',
  },
  {
    id: MathArea.SAMBAND,
    label: 'Samband och förändringar',
    icon: Icons.TrendingUp,
    description: 'Proportionalitet och hur storheter påverkar varandra.',
  },
  {
    id: MathArea.PROBLEMLÖSNING,
    label: 'Problemlösning',
    icon: Icons.Lightbulb,
    description: 'Strategier för problem utan givna standardlösningar (KLAG).',
  },
];
