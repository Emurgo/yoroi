export const insertAt = (str, pos, text) =>
  [str.slice(0, pos), text, str.slice(pos)].join('')
