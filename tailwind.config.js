/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sikora: {
          // Primärfarben - SIKORA Corporate Design
          blue: '#003A62',        // SIKORA Blau - Pantone 2965 C
          cyan: '#00A2D4',        // SIKORA Cyan

          // Sekundärfarben für Geschäftsbereiche
          gray: '#87888a',        // Draht & Kabel, Glasfaser
          'pipe-blue': '#4f8196', // Rohr & Schlauch, Platten
          'plastic-green': '#4f7d6c', // Kunststoff

          // ECOCONTROL Monitor Farben
          'monitor-blue': '#40b3ff',       // RGB: 64, 179, 255
          'monitor-green': '#7bb078',      // RGB: 123, 176, 120
          'monitor-dark-green': '#43963e', // RGB: 67, 150, 62
          'monitor-light-gray': '#e8e9e9', // RGB: 232, 233, 233
          'monitor-white': '#ffffff',      // RGB: 255, 255, 255
          'monitor-dark-gray': '#404040',  // RGB: 64, 64, 64
          'monitor-black': '#000000',      // RGB: 0, 0, 0
          'monitor-medium-gray': '#58595b', // RGB: 88, 89, 91
          'monitor-red': '#ff0000',        // RGB: 255, 0, 0
          'monitor-orange': '#ff8d3f',     // RGB: 255, 141, 63

          // PURITY System Farben
          'purity-green-1': '#92d050',     // RGB: 146, 208, 80
          'purity-blue-2': '#9dc3e6',     // RGB: 157, 195, 230
          'purity-orange-3': '#f4a778',   // RGB: 244, 167, 120
          'purity-magenta-4': '#ff00ff',  // RGB: 255, 0, 255

          // FIBER System Farben
          'fiber-blue': '#3c6697',        // RGB: 60, 102, 151
          'fiber-pink': '#ce697b',        // RGB: 206, 105, 123
        },
      },
      fontFamily: {
        // SIKORA CP Design: Inter als saubere, moderne Alternative zu Futura
        // Poppins für Überschriften (geometrisch wie Futura)
        'sikora': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'sikora-display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'], // Für Überschriften
        'verdana': ['Verdana', 'Geneva', 'Tahoma', 'sans-serif'], // E-Mail Fallback
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'], // Standard überschreiben
      },
      fontSize: {
        // SIKORA CP Design konforme Schriftgrößen
        'cp-body': ['11.5pt', { lineHeight: '1.08' }], // Word-Standardgröße
        'cp-small': ['9pt', { lineHeight: '1.5' }],    // Mindestgröße Print
        'cp-digital': ['15pt', { lineHeight: '1.5' }], // Ideal für Digital
      },
      spacing: {
        // Logo-Proportionen basierend auf CP Design Manual
        'logo-min': '2.5cm',     // Mindestbreite Logo
        'logo-20p': '20%',       // Logo = 20% der kürzeren Formatseite
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'pulse-soft': 'pulseSoft 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
