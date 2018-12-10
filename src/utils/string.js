// @flow

export const insertAt = (str: string, pos: number, text: string) =>
  [str.slice(0, pos), text, str.slice(pos)].join('')

export const containsLowerCase = (str: string) => str !== str.toUpperCase()

export const containsUpperCase = (str: string) => str !== str.toLowerCase()

export const isNumeric = (str: string) => !isNaN(str)
