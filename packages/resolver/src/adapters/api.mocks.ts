const getCardanoAddresses = {
  success: () =>
    Promise.resolve([
      {address: 'unstoppableAddress', error: null, service: 'unstoppable'},
    ]),

  error: () => Promise.resolve([{address: null, error: null, service: null}]),
} as const

const getCryptoAddressesResponse = {
  success: [
    {address: 'unstoppableAddress', error: null, service: 'unstoppable'},
  ],
  error: [{address: null, error: 'any error', service: null}],
}

export const resolverApiMocks = {
  getCardanoAddresses,
  getCryptoAddressesResponse,
} as const

export const mockResolverApi = {
  getCardanoAddresses: getCardanoAddresses.success,
} as const
