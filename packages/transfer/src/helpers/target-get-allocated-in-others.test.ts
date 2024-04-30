import {Transfer} from '@yoroi/types'
import {tokenBalanceMocks} from '@yoroi/portfolio'

import {targetGetUsedByOtherTargets} from './target-get-allocated-in-others'

describe('targetGetUsedByOtherTargets()', () => {
  it('should calculate balances breakdown correctly', () => {
    const targets: Transfer.Target[] = [
      {
        receiver: {
          resolve: '',
          as: 'address',
          selectedNameServer: undefined,
          addressRecords: undefined,
        },
        entry: {
          address: '',
          amounts: {
            [tokenBalanceMocks.ftNoTicker.info.id]: {
              ...tokenBalanceMocks.ftNoTicker,
              quantity: 100n,
            },
          },
        },
      },
      {
        receiver: {
          resolve: 'address2',
          as: 'address',
          addressRecords: undefined,
          selectedNameServer: undefined,
        },
        entry: {
          address: 'address2',
          amounts: {
            [tokenBalanceMocks.ftNoTicker.info.id]: {
              ...tokenBalanceMocks.ftNoTicker,
              quantity: 200n,
            },
          },
        },
      },
    ]

    const result = targetGetUsedByOtherTargets({targets})

    expect(result.size).toEqual(1)
    expect(result.get(0)?.get(tokenBalanceMocks.ftNoTicker.info.id)).toEqual({
      used: 200n,
    })
    expect(result.get(0)?.get(tokenBalanceMocks.ftNoTicker.info.id)).toEqual({
      used: 100n,
    })
  })
})
