import {freeze} from 'immer'

export const colorScheme = freeze(
  [
    '#01888C',
    '#FC7500',
    '#034F5D',
    '#F73F01',
    '#FC1960',
    '#C7144C',
    '#F3C100',
    '#1598F2',
    '#2465E1',
    '#F19E02',
  ] as const,
  true,
)
