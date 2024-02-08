import {Palette} from '../types'

export const darkPalette: Palette = {
  'black-static': '#000000',
  'white-static': '#FFFFFF',
  gray: {
    max: '#FFFFFF',
    900: '#E1E6F5',
    800: '#BCC5E0',
    700: '#9BA4C2',
    600: '#7C85A3',
    500: '#656C85',
    400: '#4B5266',
    300: '#3E4457',
    200: '#262A38',
    100: '#1F232E',
    50: '#15171F',
    min: '#0B0B0F',
  },
  primary: {
    900: '#E4E8F7',
    800: '#C4CFF5',
    700: '#A0B3F2',
    600: '#7892E8',
    500: '#4B6DDE',
    400: '#3154CB',
    300: '#223987',
    200: '#142049',
    100: '#111935',
  },
  secondary: {
    900: '#E4F7F3',
    800: '#C6F7ED',
    700: '#93F5E1',
    600: '#66F2D6',
    500: '#16E3BA',
    400: '#08C29D',
    300: '#0B997D',
    200: '#12705D',
    100: '#17453C',
  },
  magenta: {
    700: '#FF6B92',
    600: '#FD3468',
    500: '#FF1351',
    300: '#572835',
    100: '#2F171D',
  },
  cyan: {
    500: '#59B1F4',
    100: '#F2F9FF',
  },
  yellow: {
    500: '#ECBA09',
    100: '#31290E',
  },
  gradients: {
    'blue-green': ['#E4E8F7', '#C6F7F7'],
    green: ['#93F5E1', '#C6F7F7'],
    blue: ['#244ABF', '#4B6DDE'],
  },
  'bottom-sheet-background': '#15171F',
  'overlay-extension': {hex: '#15171F', opacity: 0.72},
  'overlay-mobile': {hex: '#15171F', opacity: 0.64},
  'sidebar-overlay': {hex: '#ffffff', opacity: 0.24},
  'sidebar-item': {hex: '#ffffff', opacity: 0.48},
}
