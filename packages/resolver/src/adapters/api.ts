import {Resolver} from '@yoroi/types'

import {handleApiGetCryptoAddress} from './handle-api'
import {unstoppableApiGetCryptoAddress} from './unstoppable-api'
import {getCnsCryptoAddress} from './cns'

type ApiConfig = {
  [Resolver.NameServer.Unstoppable]: {
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
    apiConfig[Resolver.NameServer.Unstoppable],
  )
  // @ts-expect-error TODO: bugfix on TS 5.4 (readonly array of readonly array)
  const operationsGetCryptoAddress: GetCryptoAddressOperations = [
    [Resolver.NameServer.Handle, getHandleCryptoAddress],
    [Resolver.NameServer.Unstoppable, getUnstoppableCryptoAddress],
    [Resolver.NameServer.Cns, cnsApi.getCryptoAddress],
  ] as const

  // facade to the different crypto address resolution
  const getCardanoAddresses = async (
    receiver: Resolver.Receiver['receiver'],
    strategy: Resolver.Strategy = 'all',
  ): Promise<Resolver.AddressesResponse> => {
    if (strategy === 'all')
      return resolveAll(operationsGetCryptoAddress, receiver)

    return resolveFirst(operationsGetCryptoAddress, receiver)
  }

  return {
    getCardanoAddresses,
  } as const
}

const safelyExecuteOperation = async (
  operationFn: GetCryptoAddress,
  nameServer: Resolver.NameServer,
  receiver: Resolver.Receiver['receiver'],
): Promise<Resolver.AddressResponse> => {
  try {
    const address = await operationFn(receiver)
    return {error: null, address, nameServer}
  } catch (error) {
    return {error: (error as Error).message, address: null, nameServer}
  }
}

const resolveAll = async (
  operations: GetCryptoAddressOperations,
  receiver: Resolver.Receiver['receiver'],
): Promise<Resolver.AddressesResponse> => {
  const promises = operations.map(([nameServer, operationFn]) =>
    safelyExecuteOperation(operationFn, nameServer, receiver),
  )
  const result = await Promise.all(promises)
  return result
}

const resolveFirst = async (
  operations: GetCryptoAddressOperations,
  receiver: Resolver.Receiver['receiver'],
): Promise<Resolver.AddressesResponse> => {
  const promises = operations.map(async ([nameServer, operationFn]) => {
    const address = await operationFn(receiver)
    return {error: null, address, nameServer}
  })
  try {
    const result = await Promise.any(promises)
    return [result]
  } catch (error) {
    return [{address: null, error: 'Not resolved', nameServer: null}]
  }
}

type GetCryptoAddress = (
  receiver: Resolver.Receiver['receiver'],
) => Promise<string>

type GetCryptoAddressOperations = ReadonlyArray<
  [Resolver.NameServer, GetCryptoAddress]
>
