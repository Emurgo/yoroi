import {tokenBalanceMocks} from '@yoroi/portfolio'
import {targetGetTokenBalanceBreakdown} from './target-get-token-balance-breakdown'
import {Transfer, Portfolio} from '@yoroi/types'

describe('targetGetTokenBalanceBreakdown', () => {
  it('should calculate the token balance breakdown correctly secondary', () => {
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

    const balances: Portfolio.Token.Balances['records'] = new Map([
      [tokenBalanceMocks.ftNoTicker.info.id, tokenBalanceMocks.ftNoTicker],
    ])

    const primaryBreakdown: Portfolio.PrimaryBreakdown = {
      availableRewards: 0n,
      lockedAsStorageCost: 0n,
      totalFromTxs: 0n,
    }

    const result = targetGetTokenBalanceBreakdown({
      targets,
      balances,
      primaryBreakdown,
      selectedTokenId,
      selectedTargetIndex,
    })

    expect(result.balance).toBe(3_000_003n)
    expect(result.used).toBe(200n)
    expect(result.available).toBe(2999803n)
    expect(result.initialQuantity).toBe(100n)
    expect(result.locked).toBe(0n)
    expect(result.spendable).toBe(2999803n)
  })

  it('should calculate the token balance breakdown correctly primary', () => {
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
              ...tokenBalanceMocks.primaryETH,
              quantity: 100_000n,
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
            [tokenBalanceMocks.primaryETH.info.id]: {
              ...tokenBalanceMocks.primaryETH,
              quantity: 200_000n,
            },
          },
        },
      },
    ]
    const selectedTargetIndex = 0
    const selectedTokenId = tokenBalanceMocks.primaryETH.info.id

    const balances: Portfolio.Token.Balances['records'] = new Map([
      [tokenBalanceMocks.primaryETH.info.id, tokenBalanceMocks.primaryETH],
    ])

    const primaryBreakdown: Portfolio.PrimaryBreakdown = {
      availableRewards: 0n,
      lockedAsStorageCost: 800_000n,
      totalFromTxs: 0n,
    }

    const result = targetGetTokenBalanceBreakdown({
      targets,
      balances,
      primaryBreakdown,
      selectedTokenId,
      selectedTargetIndex,
    })

    expect(result.balance).toBe(1_000_000n)
    expect(result.used).toBe(200_000n)
    expect(result.available).toBe(800_000n)
    expect(result.initialQuantity).toBe(100_000n)
    expect(result.locked).toBe(800_000n)
    expect(result.spendable).toBe(0n)
  })

  it('should return 0 when not informed', () => {
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
    const selectedTokenId = tokenBalanceMocks.nftCryptoKitty.info.id

    const balances: Portfolio.Token.Balances['records'] = new Map([
      [tokenBalanceMocks.ftNoTicker.info.id, tokenBalanceMocks.ftNoTicker],
    ])

    const primaryBreakdown: Portfolio.PrimaryBreakdown = {
      availableRewards: 0n,
      lockedAsStorageCost: 0n,
      totalFromTxs: 0n,
    }

    const result = targetGetTokenBalanceBreakdown({
      targets,
      balances,
      primaryBreakdown,
      selectedTokenId,
      selectedTargetIndex,
    })

    expect(result.balance).toBe(0n)
    expect(result.used).toBe(0n)
    expect(result.available).toBe(0n)
    expect(result.initialQuantity).toBe(0n)
    expect(result.locked).toBe(0n)
    expect(result.spendable).toBe(0n)
  })

  it('should return 0 when not wrong target', () => {
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
    const selectedTargetIndex = 3
    const selectedTokenId = tokenBalanceMocks.nftCryptoKitty.info.id

    const balances: Portfolio.Token.Balances['records'] = new Map([
      [tokenBalanceMocks.ftNoTicker.info.id, tokenBalanceMocks.ftNoTicker],
    ])

    const primaryBreakdown: Portfolio.PrimaryBreakdown = {
      availableRewards: 0n,
      lockedAsStorageCost: 0n,
      totalFromTxs: 0n,
    }

    const result = targetGetTokenBalanceBreakdown({
      targets,
      balances,
      primaryBreakdown,
      selectedTokenId,
      selectedTargetIndex,
    })

    expect(result.balance).toBe(0n)
    expect(result.used).toBe(0n)
    expect(result.available).toBe(0n)
    expect(result.initialQuantity).toBe(0n)
    expect(result.locked).toBe(0n)
    expect(result.spendable).toBe(0n)
  })
})
