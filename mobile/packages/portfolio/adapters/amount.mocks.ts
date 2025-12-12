import {Portfolio} from '@yoroi/types'

import {freeze} from 'immer'

import {tokenInfoMocks} from './token-info.mocks'

const amounts1: Portfolio.Token.AmountRecords = {
  [tokenInfoMocks.primaryETH.id]: {
    info: tokenInfoMocks.primaryETH,
    quantity: 42_000_000_000_000_000_000n,
  },
  [tokenInfoMocks.nftCryptoKitty.id]: {
    info: tokenInfoMocks.nftCryptoKitty,
    quantity: 1n,
  },
  [tokenInfoMocks.rnftWhatever.id]: {
    info: tokenInfoMocks.rnftWhatever,
    quantity: 1n,
  },
}

const amounts = {
  primaryETH: {
    info: tokenInfoMocks.primaryETH,
    quantity: 42_000_000_000_000_000_000n,
  },
  nftCryptoKitty: {info: tokenInfoMocks.nftCryptoKitty, quantity: 1n},
  rnftWhatever: {info: tokenInfoMocks.rnftWhatever, quantity: 1n},
}

const entries1: [Portfolio.Token.Id, Portfolio.Token.Amount][] = [
  [tokenInfoMocks.primaryETH.id as Portfolio.Token.Id, amounts.primaryETH],
  [
    tokenInfoMocks.nftCryptoKitty.id as Portfolio.Token.Id,
    amounts.nftCryptoKitty,
  ],
  [tokenInfoMocks.rnftWhatever.id as Portfolio.Token.Id, amounts.rnftWhatever],
]

export const amountMocks = freeze({
  amounts1,
  amounts,
  entries1,
})
