import {tokenBalanceMocks} from '@yoroi/portfolio'
import {targetGetAllocatedToOthersByToken} from './target-get-allocated-to-others-by-token'
import {Transfer} from '@yoroi/types'

describe('targetGetAllocatedToOthersByToken', () => {
  it('should return the total amount of tokens used by other targets', () => {
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
    const targetIndex = 0

    const totalUsed = targetGetAllocatedToOthersByToken({
      targets,
      targetIndex,
    })

    expect(totalUsed).toEqual(
      new Map([
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3032', 200n],
      ]),
    )
  })

  it('should return 0 if there are no other targets', () => {
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
    ]
    const targetIndex = 0

    const totalUsed = targetGetAllocatedToOthersByToken({
      targets,
      targetIndex,
    })

    expect(totalUsed).toEqual(new Map())
  })

  it('should return 0 if empty on other targets', () => {
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
              quantity: 0n,
            },
          },
        },
      },
    ]
    const targetIndex = 0

    const totalUsed = targetGetAllocatedToOthersByToken({
      targets,
      targetIndex,
    })

    expect(totalUsed).toEqual(
      new Map([[tokenBalanceMocks.ftNoTicker.info.id, 0n]]),
    )
  })

  it('should return the other tokens by other targets', () => {
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
            [tokenBalanceMocks.primaryETH.info.id]: {
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
    const targetIndex = 0

    const totalUsed = targetGetAllocatedToOthersByToken({
      targets,
      targetIndex,
    })

    expect(totalUsed).toEqual(
      new Map([
        ['14696a4676909f4e3cb1f2e60e2e08e5abed70caf5c02699be971139.3032', 200n],
      ]),
    )
  })
})
