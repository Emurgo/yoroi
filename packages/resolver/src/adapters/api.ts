import {Resolver} from '@yoroi/types'
import {getHandleCryptoAddress} from './handle-api'
import {getUnstoppableCryptoAddress} from './unstoppable-api'
import {getCnsCryptoAddress} from './cns'

enum DomainService {
  Cns = 'cns',
  Unstoppable = 'unstoppable',
  Handle = 'handle',
}

type ApiConfig = {
  [DomainService.Unstoppable]: {
    apiKey: string
  }
}

export const resolverApiMaker = (
  resolutionStrategy: Resolver.Strategy,
  apiConfig: ApiConfig,
): Resolver.Api => {
  const getCryptoAddress = async (
    receiverDomain: Resolver.Receiver['domain'],
  ) => {
    const operations = {
      [DomainService.Handle]: getHandleCryptoAddress(receiverDomain),
      [DomainService.Unstoppable]: getUnstoppableCryptoAddress(
        receiverDomain,
        apiConfig[DomainService.Unstoppable].apiKey,
      ),
      [DomainService.Cns]: getCnsCryptoAddress(receiverDomain),
    }

    if (resolutionStrategy === 'all') {
      const results = await Promise.all(
        Object.entries(operations).map(async ([service, operation]) => {
          try {
            const address = await operation
            return {error: null, address, service}
          } catch (error: any) {
            return {error: error.message, address: null, service}
          }
        }),
      )

      return results
    }

    const result = await Promise.any(
      Object.entries(operations).map(([service, operation]) =>
        operation.then((address) => ({error: null, address, service})),
      ),
    ).catch((error) => ({
      address: null,
      error,
      service: null,
    }))

    return [result]
  }

  return {
    getCryptoAddress,
  }
}
