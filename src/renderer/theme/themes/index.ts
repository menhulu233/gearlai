import type { ThemeDefinition } from './types';

import { classicLight } from './classic-light';
import { classicDark }  from './classic-dark';

/** All built-in themes. First entry is the default. */
export const allThemes: ThemeDefinition[] = [
  classicLight,
  classicDark,
];

/** Quick lookup by theme ID */
export const themeMap = new Map(allThemes.map((t) => [t.meta.id, t]));
