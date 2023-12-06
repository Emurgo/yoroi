const resolverApiSuccess = {
  getCryptoAddresses: () =>
    Promise.resolve([
      {address: 'unstoppableAddress', error: null, service: 'unstoppable'},
    ]),
} as const

const resolverApiError = {
  getCryptoAddresses: () =>
    Promise.resolve([{address: null, error: null, service: null}]),
} as const

export const mockResolverApi = {
  success: resolverApiSuccess,
  error: resolverApiError,
} as const
