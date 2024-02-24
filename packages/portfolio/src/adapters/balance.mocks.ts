import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {tokenInfoMocks} from './token-info.mocks'

const tokens1: Portfolio.Amounts = {
  [tokenInfoMocks.primaryETH.id]: `${42_000_000_000_000_000_000}`,
  [tokenInfoMocks.nftCryptoKitty.id]: `${1}`,
  [tokenInfoMocks.rnftWhatever.id]: `${1}`,
}

export const balanceMocks = freeze({
  tokens1,
})
