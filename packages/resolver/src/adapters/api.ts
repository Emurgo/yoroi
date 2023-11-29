import {Resolver} from '@yoroi/types'
import {getHandleCryptoAddress} from './handle-api'
import {getUnstoppableCryptoAddress} from './unstoppable-api'

enum DomainService {
  CNS = 'cns',
  Unstoppable = 'unstoppable',
  Handle = 'handle',
}

export const resolverApiMaker = (
  resolutionStrategy: Resolver.Strategy,
  apiConfig?: any,
): Resolver.Api => {
  const getCryptoAddress = async (
    receiverDomain: Resolver.Receiver['domain'],
  ) => {
    const operations = {
      [DomainService.Handle]: getHandleCryptoAddress(receiverDomain),
      [DomainService.Unstoppable]: getUnstoppableCryptoAddress(
        receiverDomain,
        apiConfig?.apiKeys?.unstoppableApiKey ?? undefined,
      ),
    }

    if (resolutionStrategy === 'all') {
      const results = await Promise.all(
        Object.entries(operations).map(([service, operation]) =>
          operation
            .then((address) => ({error: null, address, service}))
            .catch((error) => ({error, address: null, service})),
        ),
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
