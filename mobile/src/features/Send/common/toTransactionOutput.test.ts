import {tokenBalanceMocks} from '@yoroi/portfolio'
import {TransactionOutput} from '@yoroi/tx'
import {Transfer} from '@yoroi/types'

import {toTransactionOutput} from './toTransactionOutput'

describe('toTransactionOutput', () => {
  it('should convert Transfer.Entry to TransactionOutput correctly', () => {
    const entry: TransactionOutput = {
      address: 'exampleAddress',
      datum: {
        hash: 'exampleHash',
      },
      amounts: {
        ['.']: '10',
        [tokenBalanceMocks.nftCryptoKitty.info.id]: '20',
      },
    }

    const transferEntry: Transfer.Entry = {
      address: 'exampleAddress',
      datum: {
        hash: 'exampleHash',
      },
      amounts: {
        [tokenBalanceMocks.primaryETH.info.id]: {
          ...tokenBalanceMocks.primaryETH,
          quantity: 10n,
        },
        [tokenBalanceMocks.nftCryptoKitty.info.id]: {
          ...tokenBalanceMocks.nftCryptoKitty,
          quantity: 20n,
        },
      },
    }

    const result = toTransactionOutput(transferEntry)

    expect(result).toEqual(entry)
  })
})
