import {primaryTokenId, tokenBalanceMocks} from '@yoroi/portfolio'
import {TransactionOutput} from '@yoroi/tx'
import {Address, Balance, DatumHash, Transfer} from '@yoroi/types'

import {toTransactionOutput} from './toTransactionOutput'

describe('toTransactionOutput', () => {
  it('should convert Transfer.Entry to TransactionOutput correctly', () => {
    const entry: TransactionOutput = {
      address: 'exampleAddress' as Address,
      datum: {
        hash: 'exampleHash' as DatumHash,
      } as TransactionOutput['datum'],
      amounts: {
        [primaryTokenId]: '10',
        [tokenBalanceMocks.nftCryptoKitty.info.id]: '20',
      } as Balance.Amounts,
    }

    const transferEntry: Transfer.Entry = {
      address: 'exampleAddress' as Address,
      datum: {
        type: 'hash',
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
