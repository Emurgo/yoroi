export const isDomain = (receiver: string): boolean => {
  return /.+\..+/.test(receiver) || isHandle(receiver)
}
export const isHandle = (receiver: string): boolean => receiver.startsWith('$')
