export const splitInLines = (text: string): string => {
  const words = text.trim().split(' ')
  let result = ''
  if (words.length <= 2) {
    result = text
  } else if (words.length === 3) {
    result = `${words[0]}\n${words[1]} ${words[2]}`
  } else {
    const halfIndex = Math.ceil(words.length / 2)
    const firstLine = words.slice(0, halfIndex).join(' ')
    const secondLine = words.slice(halfIndex).join(' ')
    result = `${firstLine}\n${secondLine}`
  }

  return result
}
