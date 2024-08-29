import {tokens} from '../tokens/tokens'
import {BasePalette} from '../types'

const {opacity} = tokens

export const darkPalette: BasePalette = {
  primary_900: '#E4E8F7',
  primary_800: '#C4CFF5',
  primary_700: '#A0B3F2',
  primary_600: '#7892E8',
  primary_500: '#4B6DDE',
  primary_400: '#2E4BB0',
  primary_300: '#304489',
  primary_200: '#242D4F',
  primary_100: '#1F253B',

  secondary_900: '#E4F7F3',
  secondary_800: '#C6F7ED',
  secondary_700: '#93F5E1',
  secondary_600: '#66F2D6',
  secondary_500: '#16E3BA',
  secondary_400: '#08C29D',
  secondary_300: '#0B997D',
  secondary_200: '#12705D',
  secondary_100: '#1B3732',

  gray_max: '#FFFFFF',
  gray_900: '#E1E6F5',
  gray_800: '#BCC5E0',
  gray_700: '#9BA4C2',
  gray_600: '#7C85A3',
  gray_500: '#656C85',
  gray_400: '#4B5266',
  gray_300: '#3E4457',
  gray_200: '#262A38',
  gray_100: '#1F232E',
  gray_50: '#15171F',
  gray_min: '#0B0B0F',

  black_static: '#000000',
  white_static: '#FFFFFF',

  sys_magenta_700: '#FFC0D0',
  sys_magenta_600: '#FB9CB5',
  sys_magenta_500: '#FF7196',
  sys_magenta_300: '#572835',
  sys_magenta_100: '#2F171D',

  sys_cyan_500: '#59B1F4',
  sys_cyan_100: '#112333',

  sys_yellow_500: '#ECBA09',
  sys_yellow_100: '#31290E',

  sys_orange_500: '#FAB357',
  sys_orange_100: '#291802',

  bg_gradient_1: [
    `#1AE3BB${opacity._26}`,
    `#4B6DDE${opacity._10}`,
    `#4B6DDE${opacity._16}`,
  ],
  bg_gradient_2: [`#0B997D${opacity._48}`, `#08C29D${opacity._8}`],
  bg_gradient_3: ['#2E4BB0', '#2B3E7D'],
}
