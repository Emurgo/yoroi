import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {tokenInfoMocks} from './token-info.mocks'

const amounts1: Portfolio.Amounts = {
  [tokenInfoMocks.primaryETH.id]: 42_000_000_000_000_000_000n,
  [tokenInfoMocks.nftCryptoKitty.id]: 1n,
  [tokenInfoMocks.rnftWhatever.id]: 1n,
}

const amounts = {
  primaryETH: {
    id: tokenInfoMocks.primaryETH.id,
    quantity: 42_000_000_000_000_000_000n,
  },
  nftCryptoKitty: {id: tokenInfoMocks.nftCryptoKitty.id, quantity: 1n},
  rnftWhatever: {id: tokenInfoMocks.rnftWhatever.id, quantity: 1n},
}

const entries1: [Portfolio.Token.Id, Portfolio.Amount][] = [
  [tokenInfoMocks.primaryETH.id, amounts.primaryETH],
  [tokenInfoMocks.nftCryptoKitty.id, amounts.nftCryptoKitty],
  [tokenInfoMocks.rnftWhatever.id, amounts.rnftWhatever],
]

export const amountMocks = freeze({
  amounts1,
  amounts,
  entries1,
})
