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
    const allMethods = [
      getHandleCryptoAddress(receiverDomain),
      getUnstoppableCryptoAddress(
        receiverDomain,
        apiConfig?.apiKeys?.unstoppableApiKey ?? undefined,
      ),
    ]

    if (resolutionStrategy === 'all') {
      const addresses = await Promise.all(allMethods)
      return addresses
    }

    const address = await Promise.any(allMethods)
    return [address]
  }

  return {
    getCryptoAddress,
  }
}
