export const mockLoading = <T = unknown>() => new Promise<T>(() => undefined)
export const mockUnknownError = <T = unknown>() => Promise.reject(new Error('Unknown error')) as Promise<T>
export const mockSpecificError = <T = unknown>(error: Error) => Promise.reject(error) as Promise<T>
export const mockDelayedResponse = <T = unknown>({data, timeout = 3000}: {data: T; timeout?: number}) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), timeout)
  })

type MockOptions<T> = {
  success: () => Promise<T>
  empty: () => Promise<T>
  error: {
    unknown: () => Promise<never>
    specific: (error: Error) => Promise<never>
  }
  loading: () => Promise<never>
  delayed: ({data, timeout}: {data: T; timeout?: number}) => Promise<T>
}

export function mockMaker<T = undefined>(success: T, empty: T, overrides?: Partial<MockOptions<T>>) {
  const defaultMock: MockOptions<T> = {
    success: () => Promise.resolve(success),
    empty: () => Promise.resolve(empty),
    error: {
      unknown: mockUnknownError,
      specific: mockSpecificError,
    },
    loading: mockLoading,
    delayed: mockDelayedResponse,
  }

  const merged = {...defaultMock, ...overrides}

  // Make sure that all keys have a value (not undefined)
  Object.keys(defaultMock).forEach((key) => {
    if (merged[key] === undefined) {
      merged[key] = defaultMock[key]
    }
  })

  return merged as MockOptions<T>
}

export function mockMakerMutation() {
  return mockMaker<undefined>(undefined, undefined)
}
