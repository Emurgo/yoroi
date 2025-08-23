const getCardanoAddresses = {
  success: () =>
    Promise.resolve([
      {address: 'unstoppableAddress', error: null, nameServer: 'unstoppable'},
    ]),

  error: () =>
    Promise.resolve([{address: null, error: null, nameServer: null}]),
} as const

const getCryptoAddressesResponse = {
  success: [
    {address: 'unstoppableAddress', error: null, nameServer: 'unstoppable'},
  ],
  error: [{address: null, error: 'any error', nameServer: null}],
}

export const resolverApiMocks = {
  getCardanoAddresses,
  getCryptoAddressesResponse,
} as const

export const mockResolverApi = {
  getCardanoAddresses: getCardanoAddresses.success,
} as const
