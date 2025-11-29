import {RawUtxo} from '@yoroi/api'
import {
  Address,
  Balance,
  PolicyId,
  TokenId,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

import {toBalanceManagerSyncArgs} from './toBalanceManagerSyncArgs'

describe('toBalanceManagerSyncArgs', () => {
  const policyId = new Array(56).fill('1').join('') as PolicyId
  it('should calculate primaryStated and secondaryBalances correctly', () => {
    const rawUtxos: RawUtxo[] = [
      {
        amount: '100' as Balance.Quantity,
        receiver: '' as Address,
        tx_hash: '' as TransactionHash,
        tx_index: 0,
        utxo_id: '' as UtxoId,
        assets: [
          {
            tokenId: `${policyId}.DEAD` as TokenId,
            amount: '50' as Balance.Quantity,
            policyId,
            name: 'DEAD',
          },
          {
            tokenId: `${policyId}.DEADFEED` as TokenId,
            amount: '30' as Balance.Quantity,
            policyId,
            name: 'DEADFEED',
          },
        ],
      },
      {
        receiver: '' as Address,
        tx_hash: '' as TransactionHash,
        tx_index: 0,
        utxo_id: '' as UtxoId,
        amount: '200' as Balance.Quantity,
        assets: [
          {
            tokenId: `${policyId}.DEAD` as TokenId,
            amount: '70' as Balance.Quantity,
            policyId,
            name: 'DEAD',
          },
          {
            tokenId: `${policyId}.3031` as TokenId,
            amount: '80' as Balance.Quantity,
            policyId,
            name: '3031',
          },
        ],
      },
    ]
    const lockedAsStorageCost = 10n

    const result = toBalanceManagerSyncArgs(rawUtxos, lockedAsStorageCost)

    expect(result.primaryStated.totalFromTxs).toBe(300n)
    expect(result.primaryStated.lockedAsStorageCost).toBe(10n)
    expect(
      result.secondaryBalances.get(`${policyId}.DEAD` as TokenId)?.quantity,
    ).toBe(120n)
    expect(
      result.secondaryBalances.get(`${policyId}.DEADFEED` as TokenId)?.quantity,
    ).toBe(30n)
    expect(
      result.secondaryBalances.get(`${policyId}.3031` as TokenId)?.quantity,
    ).toBe(80n)
  })
})
