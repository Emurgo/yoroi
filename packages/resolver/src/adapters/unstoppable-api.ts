import {Resolution} from '@unstoppabledomains/resolution'
import {Resolver} from '@yoroi/types'
import {z} from 'zod'
import {handleZodErrors} from './zod-errors'

export const getUnstoppableCryptoAddress = async (
  receiverDomain: Resolver.Receiver['domain'],
  apiKey: string,
): Promise<string> => {
  try {
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

    return validatedHandleResponse
  } catch (error: unknown) {
    const zodErrorMessage = handleZodErrors(error)

    if (zodErrorMessage) throw new UnstoppableValidationError(zodErrorMessage)
    throw new UnstoppableUnknownError(JSON.stringify(error))
  }
}

const StoppableResponseSchema = z.string()

class UnstoppableValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnstoppableValidationError'
  }
}

class UnstoppableUnknownError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnstoppableUnknownError'
  }
}
