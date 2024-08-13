import {tokenBalanceMocks} from '@yoroi/portfolio'
import {Transfer} from '@yoroi/types'

import {YoroiEntry} from '../../../yoroi-wallets/types'
import {toYoroiEntry} from './toYoroiEntry'

describe('toYoroiEntry', () => {
  it('should convert Transfer.Entry to YoroiEntry correctly', () => {
    const entry: YoroiEntry = {
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

    const result = toYoroiEntry(transferEntry)

    expect(result).toEqual(entry)
  })
})
