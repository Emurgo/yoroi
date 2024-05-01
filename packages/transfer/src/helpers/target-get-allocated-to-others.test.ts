import {Transfer} from '@yoroi/types'
import {tokenBalanceMocks} from '@yoroi/portfolio'

import {targetGetAllocatedToOthers} from './target-get-allocated-to-others'

describe('TransferAllocatedToOtherTargets', () => {
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
              quantity: 50n,
            },
            [tokenBalanceMocks.primaryETH.info.id]: {
              ...tokenBalanceMocks.primaryETH,
              quantity: 50n,
            },
          },
        },
      },
    ]

    const result = targetGetAllocatedToOthers({targets})

    expect(result.size).toEqual(3)
    expect(result).toEqual(
      new Map([
        [
          0,
          new Map([
            [tokenBalanceMocks.ftNoTicker.info.id, 250n],
            [tokenBalanceMocks.primaryETH.info.id, 50n],
          ]),
        ],
        [
          1,
          new Map([
            [tokenBalanceMocks.ftNoTicker.info.id, 150n],
            [tokenBalanceMocks.primaryETH.info.id, 50n],
          ]),
        ],
        [2, new Map([[tokenBalanceMocks.ftNoTicker.info.id, 300n]])],
      ]),
    )
  })
})
