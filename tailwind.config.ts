import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          hover: 'var(--primary-hover)',
          subtle: 'var(--primary-subtle)',
          text: 'var(--primary-text)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Tagiva Brand & Status Semantics (DESIGN_SYSTEM.md Section 3.3 & 3.4)
        tagiva: {
          navy: '#1B3668',
          green: '#78BE43',
        },
        status: {
          draft: {
            bg: '#F1F5F9',
            border: '#CBD5E1',
            text: '#334155',
          },
          sent: {
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1D4ED8',
          },
          paid: {
            bg: '#ECFDF5',
            border: '#A7F3D0',
            text: '#047857',
          },
          overdue: {
            bg: '#FEF2F2',
            border: '#FECACA',
            text: '#B91C1C',
          },
          warning: {
            bg: '#FFFBEB',
            border: '#FDE68A',
            text: '#B45309',
          },
          pro: {
            bg: '#EEF2FF',
            border: '#C7D2FE',
            text: '#4338CA',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        invoice: ['var(--font-invoice)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
