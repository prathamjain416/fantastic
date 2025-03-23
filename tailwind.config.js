/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF4F00',
        secondary: '#111826',
        accent: '#C2410E',
        neutral: {
          50: '#FFFFFF',
          900: '#000000',
        }
      },
      screens: {
        'xs': '320px',
        'sm': '481px',
        'md': '769px',
        'lg': '1024px',
        'xl': '1280px',
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
      fontSize: {
        'xxs': '0.625rem',
        'tiny': '0.75rem',
      },
      minHeight: {
        'screen-dynamic': ['100vh', '100dvh'],
      },
      maxWidth: {
        'readable': '65ch',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.5s ease-out',
        scaleIn: 'scaleIn 0.3s ease-out'
      }
    },
  },
  plugins: [],
};