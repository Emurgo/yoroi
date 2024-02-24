import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {tokenInfoMocks} from './token-info.mocks'

const tokens1: Portfolio.Amounts = {
  [tokenInfoMocks.primaryETH.id]: BigInt(42_000_000_000_000_000_000),
  [tokenInfoMocks.nftCryptoKitty.id]: BigInt(1),
  [tokenInfoMocks.rnftWhatever.id]: BigInt(1),
}

export const balanceMocks = freeze({
  tokens1,
})
