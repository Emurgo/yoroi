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
      wrapCryptoAddressRequest(getHandleCryptoAddress, receiverDomain),
      wrapCryptoAddressRequest(
        getUnstoppableCryptoAddress,
        receiverDomain,
        apiConfig?.apiKeys?.unstoppableApiKey ?? undefined,
      ),
    ]

    if (resolutionStrategy === 'all') {
      return Promise.all(operations)
    } else {
      return Promise.any(
        operations.map((operation) => operation.catch((error: any) => error)),
      )
    }
  }

  return {getCryptoAddress}
}

const wrapCryptoAddressRequest = async (
  getCryptoAddress: (receiver: string, apiConfig: any) => Promise<string>,
  receiverDomain: string,
  apiKey?: string,
): Promise<Resolver.AddressResponse> => {
  try {
    const address = await getCryptoAddress(receiverDomain, apiKey ?? undefined)
    return {address, error: null}
  } catch (error: any) {
    return Promise.reject({address: null, error: error.message})
  }
}
