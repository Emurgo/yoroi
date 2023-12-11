import {Resolver} from '@yoroi/types'

import {handleApiGetCryptoAddress} from './handle-api'
import {unstoppableApiGetCryptoAddress} from './unstoppable-api'
import {getCnsCryptoAddress} from './cns'

type ApiConfig = {
  [Resolver.Service.Unstoppable]: {
    apiKey: string
  }
}

const initialDeps = {
  unstoppableApi: {
    getCryptoAddress: unstoppableApiGetCryptoAddress,
  },
  handleApi: {
    getCryptoAddress: handleApiGetCryptoAddress,
  },
  cnsApi: {
    getCryptoAddress: getCnsCryptoAddress,
  },
} as const

export const resolverApiMaker = (
  {
    apiConfig,
  }: {
    apiConfig: Readonly<ApiConfig>
  },
  {
    unstoppableApi,
    handleApi,
    cnsApi,
  }: {
    unstoppableApi: {
      getCryptoAddress: typeof unstoppableApiGetCryptoAddress
    }
    handleApi: {
      getCryptoAddress: typeof handleApiGetCryptoAddress
    }
    cnsApi: {
      getCryptoAddress: typeof getCnsCryptoAddress
    }
  } = initialDeps,
): Resolver.Api => {
  const getHandleCryptoAddress = handleApi.getCryptoAddress()
  const getUnstoppableCryptoAddress = unstoppableApi.getCryptoAddress(
    apiConfig[Resolver.Service.Unstoppable],
  )
  // @ts-expect-error TODO: bugfix on TS 5.4 (readonly array of readonly array)
  const operationsGetCryptoAddress: GetCryptoAddressOperations = [
    [Resolver.Service.Handle, getHandleCryptoAddress],
    [Resolver.Service.Unstoppable, getUnstoppableCryptoAddress],
    [Resolver.Service.Cns, cnsApi.getCryptoAddress],
  ] as const

  // facade to the different crypto address resolution
  const getCardanoAddresses = async (
    receiverDomain: Resolver.Receiver['domain'],
    resolutionStrategy: Resolver.Strategy = 'all',
  ): Promise<Resolver.AddressesResponse> => {
    if (resolutionStrategy === 'all')
      return resolveAll(operationsGetCryptoAddress, receiverDomain)

    return resolveFirst(operationsGetCryptoAddress, receiverDomain)
  }

  return {
    getCardanoAddresses,
  } as const
}

const safelyExecuteOperation = async (
  operationFn: GetCryptoAddress,
  service: Resolver.Service,
  receiverDomain: Resolver.Receiver['domain'],
): Promise<Resolver.AddressResponse> => {
  try {
    const address = await operationFn(receiverDomain)
    return {error: null, address, service}
  } catch (error) {
    return {error: (error as Error).message, address: null, service}
  }
}

const resolveAll = async (
  operations: GetCryptoAddressOperations,
  receiverDomain: Resolver.Receiver['domain'],
): Promise<Resolver.AddressesResponse> => {
  const promises = operations.map(([service, operationFn]) =>
    safelyExecuteOperation(operationFn, service, receiverDomain),
  )
  const result = await Promise.all(promises)
  return result
}

const resolveFirst = async (
  operations: GetCryptoAddressOperations,
  receiverDomain: Resolver.Receiver['domain'],
): Promise<Resolver.AddressesResponse> => {
  const promises = operations.map(async ([service, operationFn]) => {
    const address = await operationFn(receiverDomain)
    return {error: null, address, service}
  })
  try {
    const result = await Promise.any(promises)
    return [result]
  } catch (error) {
    return [{address: null, error: 'Not resolved', service: null}]
  }
}

type GetCryptoAddress = (
  receiverDomain: Resolver.Receiver['domain'],
) => Promise<string>

type GetCryptoAddressOperations = ReadonlyArray<
  [Resolver.Service, GetCryptoAddress]
>
