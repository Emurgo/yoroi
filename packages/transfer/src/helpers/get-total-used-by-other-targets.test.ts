import {tokenBalanceMocks} from '@yoroi/portfolio'
import {getTotalUsedByOtherTargets} from './get-total-used-by-other-targets'
import {Transfer} from '@yoroi/types'

describe('getTotalUsedByOtherTargets', () => {
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
    const selectedTargetIndex = 0
    const selectedTokenId = tokenBalanceMocks.ftNoTicker.info.id

    const totalUsed = getTotalUsedByOtherTargets({
      targets,
      selectedTargetIndex,
      selectedTokenId,
    })

    expect(totalUsed).toBe(200n)
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
    const selectedTargetIndex = 0
    const selectedTokenId = tokenBalanceMocks.ftNoTicker.info.id

    const totalUsed = getTotalUsedByOtherTargets({
      targets,
      selectedTargetIndex,
      selectedTokenId,
    })

    expect(totalUsed).toBe(0n)
  })

  it('should return 0 if the selected token is not used by other targets', () => {
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
    const selectedTargetIndex = 0
    const selectedTokenId = 'anyOther.token'

    const totalUsed = getTotalUsedByOtherTargets({
      targets,
      selectedTargetIndex,
      selectedTokenId,
    })

    expect(totalUsed).toBe(0n)
  })
})
