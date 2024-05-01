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
    const tokenId = tokenBalanceMocks.ftNoTicker.info.id

    const totalUsed = targetGetAllocatedToOthersByToken({
      targets,
      targetIndex,
      tokenId,
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
    const targetIndex = 0
    const tokenId = tokenBalanceMocks.ftNoTicker.info.id

    const totalUsed = targetGetAllocatedToOthersByToken({
      targets,
      targetIndex,
      tokenId,
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
    const targetIndex = 0
    const tokenId = 'anyOther.token'

    const totalUsed = targetGetAllocatedToOthersByToken({
      targets,
      targetIndex,
      tokenId,
    })

    expect(totalUsed).toBe(0n)
  })
})
