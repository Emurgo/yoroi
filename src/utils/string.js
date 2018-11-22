export const insertAt = (str, pos, text) =>
  [str.slice(0, pos), text, str.slice(pos)].join('')

export const containsLowerCase = (str) => str !== str.toUpperCase()

export const containsUpperCase = (str) => str !== str.toLowerCase()

export const isNumeric = (str) => !isNaN(str)
