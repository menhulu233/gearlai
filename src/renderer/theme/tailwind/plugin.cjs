/**
 * Tailwind CSS v3 plugin — bridges --gearl-* CSS variables into Tailwind utility classes.
 *
 * Usage in tailwind.config.js:
 *   plugins: [require('./src/renderer/theme/tailwind/plugin.cjs')]
 *
 * Provides: bg-background, text-foreground, bg-primary, border-border, etc.
 * Also provides legacy claude.* aliases for backward compatibility.
 */
const plugin = require('tailwindcss/plugin');

module.exports = plugin(function () {
  // The plugin itself is a no-op; we only extend the theme below.
}, {
  theme: {
    extend: {
      colors: {
        // === Semantic theme colors (driven by CSS variables) ===
        background:    'var(--gearl-background)',
        foreground:    'var(--gearl-foreground)',
        primary: {
          DEFAULT:     'var(--gearl-primary)',
          foreground:  'var(--gearl-primary-foreground)',
          hover:       'var(--gearl-primary-hover)',
          muted:       'var(--gearl-primary-muted)',
          dark:        'var(--gearl-primary-hover)',
        },
        accent: {
          DEFAULT:     'var(--gearl-accent)',
          foreground:  'var(--gearl-accent-foreground)',
        },
        surface: {
          DEFAULT:     'var(--gearl-surface)',
          foreground:  'var(--gearl-surface-foreground)',
          raised:      'var(--gearl-surface-raised)',
          overlay:     'var(--gearl-surface-overlay)',
          inset:       'var(--gearl-surface-raised)',
        },
        border: {
          DEFAULT:     'var(--gearl-border)',
          subtle:      'var(--gearl-border-subtle)',
          input:       'var(--gearl-input-border)',
        },
        muted:         'var(--gearl-text-muted)',
        destructive: {
          DEFAULT:     'var(--gearl-destructive)',
          foreground:  'var(--gearl-destructive-foreground)',
        },
        success:       'var(--gearl-success)',
        warning:       'var(--gearl-warning)',

        // === Legacy claude.* aliases (map to --gearl-* for backward compat) ===
        claude: {
          bg:                'var(--gearl-background)',
          surface:           'var(--gearl-surface)',
          surfaceHover:      'var(--gearl-surface-raised)',
          surfaceMuted:      'var(--gearl-surface-raised)',
          surfaceInset:      'var(--gearl-surface-raised)',
          border:            'var(--gearl-border)',
          borderLight:       'var(--gearl-border-subtle)',
          text:              'var(--gearl-text-primary)',
          textSecondary:     'var(--gearl-text-secondary)',
          darkBg:            'var(--gearl-background)',
          darkSurface:       'var(--gearl-surface)',
          darkSurfaceHover:  'var(--gearl-surface-raised)',
          darkSurfaceMuted:  'var(--gearl-surface-raised)',
          darkSurfaceInset:  'var(--gearl-surface-raised)',
          darkBorder:        'var(--gearl-border)',
          darkBorderLight:   'var(--gearl-border-subtle)',
          darkText:          'var(--gearl-text-primary)',
          darkTextSecondary: 'var(--gearl-text-secondary)',
          accent:            'var(--gearl-primary)',
          accentHover:       'var(--gearl-primary-hover)',
          accentLight:       'var(--gearl-primary)',
          accentMuted:       'var(--gearl-primary-muted)',
        },
        secondary: {
          DEFAULT: 'var(--gearl-text-secondary)',
          dark:    'var(--gearl-border)',
        },
      },
      borderRadius: {
        theme: 'var(--gearl-radius)',
      },
    },
  },
});
