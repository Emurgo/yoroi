import {RawUtxo} from '../../../../yoroi-wallets/types'
import {toBalanceManagerSyncArgs} from './toBalanceManagerSyncArgs'

describe('toBalanceManagerSyncArgs', () => {
  const policyId = new Array(56).fill('1').join('')
  it('should calculate primaryStated and secondaryBalances correctly', () => {
    const rawUtxos: RawUtxo[] = [
      {
        amount: '100',
        receiver: '',
        tx_hash: '',
        tx_index: 0,
        utxo_id: '',
        assets: [
          {assetId: `${policyId}.DEAD`, amount: '50', policyId, name: 'DEAD'},
          {assetId: `${policyId}.DEADFEED`, amount: '30', policyId, name: 'DEADFEED'},
        ],
      },
      {
        receiver: '',
        tx_hash: '',
        tx_index: 0,
        utxo_id: '',
        amount: '200',
        assets: [
          {assetId: `${policyId}.DEAD`, amount: '70', policyId, name: 'DEAD'},
          {assetId: `${policyId}.3031`, amount: '80', policyId, name: '3031'},
        ],
      },
    ]
    const lockedAsStorageCost = 10n

    const result = toBalanceManagerSyncArgs(rawUtxos, lockedAsStorageCost)

    expect(result.primaryStated.totalFromTxs).toBe(300n)
    expect(result.primaryStated.lockedAsStorageCost).toBe(10n)
    expect(result.secondaryBalances.get(`${policyId}.DEAD`)?.quantity).toBe(120n)
    expect(result.secondaryBalances.get(`${policyId}.DEADFEED`)?.quantity).toBe(30n)
    expect(result.secondaryBalances.get(`${policyId}.3031`)?.quantity).toBe(80n)
  })
})
