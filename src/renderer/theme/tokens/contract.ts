/**
 * Token Contract — defines all semantic variables a theme must provide.
 *
 * Naming: --gearl-{category}-{name}
 * Convention: shadcn/ui background/foreground pairing + Radix 12-step gray scale
 *
 * Every theme (ThemeDefinition.tokens) must supply a value for each key.
 */
export const TOKEN_CONTRACT = {
  // ── Brand ──
  'primary':            '--gearl-primary',
  'primary-foreground': '--gearl-primary-foreground',
  'primary-hover':      '--gearl-primary-hover',
  'primary-muted':      '--gearl-primary-muted',

  // ── Accent ──
  'accent':             '--gearl-accent',
  'accent-foreground':  '--gearl-accent-foreground',

  // ── Surface / Background ──
  'background':         '--gearl-background',
  'foreground':         '--gearl-foreground',
  'surface':            '--gearl-surface',
  'surface-foreground': '--gearl-surface-foreground',
  'surface-raised':     '--gearl-surface-raised',
  'surface-overlay':    '--gearl-surface-overlay',

  // ── Chat bubbles ──
  'chat-user':              '--gearl-chat-user',
  'chat-user-foreground':   '--gearl-chat-user-foreground',
  'chat-bot':               '--gearl-chat-bot',
  'chat-bot-foreground':    '--gearl-chat-bot-foreground',

  // ── Text hierarchy ──
  'text-primary':       '--gearl-text-primary',
  'text-secondary':     '--gearl-text-secondary',
  'text-muted':        '--gearl-text-muted',

  // ── Borders ──
  'border':             '--gearl-border',
  'border-subtle':      '--gearl-border-subtle',
  'input-border':       '--gearl-input-border',

  // ── Scrollbar ──
  'scroll-thumb':       '--gearl-scroll-thumb',
  'scroll-thumb-hover': '--gearl-scroll-thumb-hover',

  // ── Decorative gradients ──
  'gradient-1':         '--gearl-gradient-1',
  'gradient-2':         '--gearl-gradient-2',

  // ── Status ──
  'destructive':            '--gearl-destructive',
  'destructive-foreground': '--gearl-destructive-foreground',
  'success':                '--gearl-success',
  'warning':                '--gearl-warning',

  // ── Gray scale 11 steps (gray-1=lightest → gray-11=darkest, all themes) ──
  'gray-1':  '--gearl-gray-1',
  'gray-2':  '--gearl-gray-2',
  'gray-3':  '--gearl-gray-3',
  'gray-4':  '--gearl-gray-4',
  'gray-5':  '--gearl-gray-5',
  'gray-6':  '--gearl-gray-6',
  'gray-7':  '--gearl-gray-7',
  'gray-8':  '--gearl-gray-8',
  'gray-9':  '--gearl-gray-9',
  'gray-10': '--gearl-gray-10',
  'gray-11': '--gearl-gray-11',

  // ── Radius ──
  'radius':  '--gearl-radius',
} as const;

export type TokenName = keyof typeof TOKEN_CONTRACT;
export type CSSVarName = (typeof TOKEN_CONTRACT)[TokenName];

/** All token keys as an array */
export const TOKEN_NAMES = Object.keys(TOKEN_CONTRACT) as TokenName[];
