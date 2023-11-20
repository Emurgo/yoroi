import {Resolver} from '@yoroi/types'
import {getHandleCryptoAddress} from './handle-api'
import {getUnstoppableCryptoAddress} from './unstoppable-api'

export const resolverApiMaker = (
  resolutionStrategy: Resolver.Strategy,
  apiConfig?: any,
): Resolver.Api => {
  const getCryptoAddress = async (
    receiverDomain: Resolver.Receiver['domain'],
  ) => {
    const operations = [
      getHandleCryptoAddress(receiverDomain),
      getUnstoppableCryptoAddress(
        receiverDomain,
        apiConfig?.apiKeys?.unstoppableApiKey ?? undefined,
      ),
    ]

    if (resolutionStrategy === 'all') {
      const results = await Promise.all(
        operations.map((operation) =>
          operation
            .then((address) => ({
              address,
              error: null,
            }))
            .catch((error) => ({error, address: null})),
        ),
      )

      return results
    }

    const result = await Promise.any(
      operations.map((operation) =>
        operation.then((address) => ({
          address,
          error: null,
        })),
      ),
    ).catch((error) => ({address: null, error}))

    return [result]
  }

  return {
    getCryptoAddress,
  }
}
