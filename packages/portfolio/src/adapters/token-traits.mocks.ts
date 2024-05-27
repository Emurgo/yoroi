import {Api, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

const nftCryptoKitty: Portfolio.Token.Traits = {
  totalItems: 1,
  traits: [
    {type: 'rarity', value: 'common', rarity: 'common'},
    {type: 'color', value: 'blue', rarity: 'common'},
  ],
}

const rnftWhatever: Portfolio.Token.Traits = {
  totalItems: 1,
  traits: [
    {type: 'rarity', value: 'rare', rarity: 'rare'},
    {type: 'color', value: 'red', rarity: 'rare'},
  ],
}

const apiResponseTokenTraits: Readonly<
  Record<'success' | 'error', Api.Response<Portfolio.Api.TokenTraitsResponse>>
> = freeze(
  {
    success: {
      tag: 'right',
      value: {
        status: 200,
        data: nftCryptoKitty,
      },
    },
    error: {
      tag: 'left',
      error: {
        status: 404,
        responseData: null,
        message: 'Not found',
      },
    },
  },
  true,
)

export const tokenTraitsMocks = freeze({
  nftCryptoKitty,
  rnftWhatever,

  apiResponse: apiResponseTokenTraits,
})
