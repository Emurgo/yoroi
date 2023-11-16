import {Resolution} from '@unstoppabledomains/resolution'
import {Resolver} from '@yoroi/types'
import {z} from 'zod'

export const getUnstoppableCryptoAddress = async (
  receiverDomain: Resolver.Receiver['domain'],
  apiKey: string,
): Promise<Resolver.AddressResponse> => {
  const result: Resolver.AddressResponse = {
    error: null,
    address: null,
  }

  const resolution = new Resolution({
    sourceConfig: {
      uns: {
        locations: {
          Layer1: {
            url: `https://mainnet.infura.io/v3/${apiKey}`,
            network: 'mainnet',
          },
          Layer2: {
            url: `https://polygon-mainnet.infura.io/v3/${apiKey}`,
            network: 'polygon-mainnet',
          },
        },
      },
      zns: {
        url: 'https://api.zilliqa.com',
        network: 'mainnet',
      },
    },
  })

  const response = await resolution.addr(receiverDomain, 'ADA')

  const validatedHandleResponse = StoppableResponseSchema.parse(response)

  result.address = validatedHandleResponse
  return result
}

export const StoppableResponseSchema = z.string()
