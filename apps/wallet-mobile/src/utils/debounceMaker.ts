export const debounceMaker = <T extends (...args: never[]) => unknown>(callback: T, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null

  const clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }

  const call = (...args: Parameters<T>) => {
    clear()

    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  return {
    clear,
    call,
  } as const
}
