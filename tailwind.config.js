/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        elevated: 'var(--elevated)',
        'elevated-2': 'var(--elevated-2)',
        faint: 'var(--faint)',
        selected: 'var(--selected)',
        'on-primary': 'var(--on-primary)',
        'on-critical': 'var(--on-critical)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        hover: 'var(--hover)',
        scrim: 'var(--scrim)',

        // Fills, icons, borders.
        primary: 'var(--primary)',
        lilac: 'var(--lilac)',
        deep: 'var(--deep)',
        critical: 'var(--critical)',
        warning: 'var(--warning)',
        success: 'var(--success)',
        info: 'var(--info)',

        // Text-safe accents — AA verified on every surface in both themes.
        'primary-text': 'var(--primary-text)',
        'critical-text': 'var(--critical-text)',
        'warning-text': 'var(--warning-text)',
        'success-text': 'var(--success-text)',
        'info-text': 'var(--info-text)',
      },
      borderRadius: {
        ctrl: 'var(--radius-ctrl)',
        card: 'var(--radius-card)',
        modal: 'var(--radius-modal)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      // Dense console scale: 12/13/15/20/24/32/48.
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['13px', '19px'],
        md: ['15px', '22px'],
        base: ['16px', '24px'],
        lg: ['20px', '28px'],
        xl: ['24px', '32px'],
        '2xl': ['32px', '40px'],
        '3xl': ['48px', '52px'],
      },
      transitionTimingFunction: { ease: 'var(--ease)' },
      transitionDuration: { fast: 'var(--dur-fast)', base: 'var(--dur-base)' },
      animation: {
        'fade-in': 'su-fade-in var(--dur-fast) var(--ease)',
        'slide-up': 'su-slide-up var(--dur-base) var(--ease)',
        'scale-in': 'su-scale-in var(--dur-base) var(--ease)',
        shimmer: 'su-shimmer 1.6s linear infinite',
        pulse: 'su-pulse 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
