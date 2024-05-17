import {Resolver} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'

import {handleApiGetCryptoAddress} from './handle/api'
import {unstoppableApiGetCryptoAddress} from './unstoppable/api'
import {cnsCryptoAddress} from './cns/api'
import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {fetchData} from '@yoroi/common'

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
    getCryptoAddress: cnsCryptoAddress,
  },
} as const

export const resolverApiMaker = (
  {
    apiConfig,
    cslFactory,
    isMainnet = true,
  }: {
    apiConfig: Readonly<ApiConfig>
    cslFactory: (scope: string) => WasmModuleProxy
    isMainnet?: boolean
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
      getCryptoAddress: typeof cnsCryptoAddress
    }
  } = initialDeps,
): Resolver.Api => {
  const getHandleCryptoAddress = handleApi.getCryptoAddress({
    request: fetchData,
    isMainnet,
  })
  const getUnstoppableCryptoAddress = unstoppableApi.getCryptoAddress(
    apiConfig[Resolver.NameServer.Unstoppable],
  )
  const getCnsCryptoAddress = cnsApi.getCryptoAddress(cslFactory, isMainnet)
  const operationsGetCryptoAddress: GetCryptoAddressOperations = [
    [Resolver.NameServer.Handle, getHandleCryptoAddress],
    [Resolver.NameServer.Unstoppable, getUnstoppableCryptoAddress],
    [Resolver.NameServer.Cns, getCnsCryptoAddress],
  ] as const

  // facade to the different name servers
  const getCardanoAddresses = async (
    {
      resolve,
      strategy = 'all',
    }: {
      resolve: Resolver.Receiver['resolve']
      strategy: Resolver.Strategy
    },
    fetcherConfig?: AxiosRequestConfig,
  ): Promise<Resolver.AddressesResponse> => {
    if (strategy === 'all')
      return resolveAll(operationsGetCryptoAddress, resolve, fetcherConfig)

    return resolveFirst(operationsGetCryptoAddress, resolve, fetcherConfig)
  }

  return {
    getCardanoAddresses,
  } as const
}

const safelyExecuteOperation = async (
  operationFn: GetCryptoAddress,
  nameServer: Resolver.NameServer,
  resolve: Resolver.Receiver['resolve'],
  fetcherConfig?: AxiosRequestConfig,
): Promise<Resolver.AddressResponse> => {
  try {
    const address = await operationFn(resolve, fetcherConfig)
    return {error: null, address, nameServer}
  } catch (error: any) {
    return {error, address: null, nameServer}
  }
}

const resolveAll = async (
  operations: GetCryptoAddressOperations,
  resolve: Resolver.Receiver['resolve'],
  fetcherConfig?: AxiosRequestConfig,
): Promise<Resolver.AddressesResponse> => {
  const promises = operations.map(([nameServer, operationFn]) =>
    safelyExecuteOperation(operationFn, nameServer, resolve, fetcherConfig),
  )
  const result = await Promise.all(promises)
  return result
}

const resolveFirst = async (
  operations: GetCryptoAddressOperations,
  resolve: Resolver.Receiver['resolve'],
  fetcherConfig?: AxiosRequestConfig,
): Promise<Resolver.AddressesResponse> => {
  const promises = operations.map(async ([nameServer, operationFn]) => {
    const address = await operationFn(resolve, fetcherConfig)
    return {error: null, address, nameServer}
  })
  try {
    const result = await Promise.any(promises)
    return [result]
  } catch {
    return [
      {address: null, error: new Resolver.Errors.NotFound(), nameServer: null},
    ]
  }
}

type GetCryptoAddress = (
  resolve: Resolver.Receiver['resolve'],
  fetcherConfig?: AxiosRequestConfig,
) => Promise<string>

type GetCryptoAddressOperations = ReadonlyArray<
  [Resolver.NameServer, GetCryptoAddress]
>
