module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: '#0F766E',
        'teal-dark': '#0B5A54',
        'teal-darker': '#083F3B',
        'teal-soft': '#E1F5F2',
        'teal-mid': '#14B8A6',
        amber: '#F59E0B',
        green: '#22C55E',
        red: '#EF4444',
        blue: '#3B82F6',
        ink: '#121A19',
        'ink-2': '#44514F',
        'ink-3': '#87938F',
        line: '#E1E9E7',
        surf: '#F6FAF9',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '10px',
        xs: '12px',
        sm: '13px',
        base: '14px',
        lg: '15px',
        xl: '18px',
        '2xl': '24px',
        '3xl': '32px',
      },
    },
  },
  plugins: [],
};
