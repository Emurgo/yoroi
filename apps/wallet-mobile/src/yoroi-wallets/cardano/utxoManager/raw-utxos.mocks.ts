import {RawUtxo} from '../../types'

export const mockRawUtxos: ReadonlyArray<RawUtxo> = [
  {
    amount: '50',
    receiver: 'addr1',
    tx_hash: 'hash1',
    tx_index: 0,
    utxo_id: 'id1#0',
    assets: [],
  },
  {
    amount: '150',
    receiver: 'addr2',
    tx_hash: 'hash2',
    tx_index: 1,
    utxo_id: 'id2#2',
    assets: [
      {
        amount: '100',
        assetId: 'asset1',
        name: 'asset1',
        policyId: 'policy1',
      },
    ],
  },
  {amount: '200', receiver: 'addr3', tx_hash: 'hash3', tx_index: 2, utxo_id: 'id3#1', assets: []},
  {amount: '250', receiver: 'addr3', tx_hash: 'hash3', tx_index: 2, utxo_id: 'id3#21', assets: []},
] as const
