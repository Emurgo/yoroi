export const insertAt = (str: string, pos: number, text: string) => [str.slice(0, pos), text, str.slice(pos)].join('')
