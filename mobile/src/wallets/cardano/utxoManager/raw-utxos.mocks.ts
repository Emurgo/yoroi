import {RawUtxo} from '@yoroi/api'
import {
  Address,
  AssetName,
  BalanceQuantity,
  PolicyId,
  Portfolio,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

/**
 * Helper function to create a mock RawUtxo without individual field casts
 * This allows writing mock data naturally while ensuring proper branding
 */
function createMockRawUtxo(data: {
  amount: string
  receiver: string
  tx_hash: string
  tx_index: number
  utxo_id: string
  assets?: Array<{
    amount: string
    tokenId: string
    name: string
    policyId: string
  }>
}): RawUtxo {
  return {
    amount: data.amount as BalanceQuantity,
    receiver: data.receiver as Address,
    tx_hash: data.tx_hash as TransactionHash,
    tx_index: data.tx_index,
    utxo_id: data.utxo_id as UtxoId,
    assets: (data.assets ?? []).map((asset) => ({
      amount: asset.amount as BalanceQuantity,
      tokenId: asset.tokenId as Portfolio.Token.Id,
      name: asset.name as AssetName,
      policyId: asset.policyId as PolicyId,
    })),
  }
}

const rawMockData = [
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
        tokenId: 'policy1.asset1',
        name: 'asset1',
        policyId: 'policy1',
      },
    ],
  },
  {
    amount: '200',
    receiver: 'addr3',
    tx_hash: 'hash3',
    tx_index: 2,
    utxo_id: 'id3#1',
    assets: [],
  },
  {
    amount: '250',
    receiver: 'addr3',
    tx_hash: 'hash3',
    tx_index: 2,
    utxo_id: 'id3#21',
    assets: [],
  },
]

export const mockRawUtxos = rawMockData.map(
  createMockRawUtxo,
) satisfies ReadonlyArray<RawUtxo>
