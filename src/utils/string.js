// @flow

export const insertAt = (
  str: string,
  pos: number,
  text: string
): string => (
  [str.slice(0, pos), text, str.slice(pos)].join('')
)
