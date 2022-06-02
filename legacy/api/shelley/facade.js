// @flow

import type {RawTransaction} from '../../api/types'
import type {Transaction} from '../../types/HistoryTransaction'

export const checkAndFacadeTransactionAsync = async (tx: RawTransaction): Promise<Transaction> => {
  return {
    id: tx.hash,
    type: tx.type,
    fee: tx.fee ?? undefined,
    status: tx.tx_state,
    inputs: tx.inputs.map((i) => ({
      address: i.address,
      amount: i.amount,
      assets: (i.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
    outputs: tx.outputs.map((o) => ({
      address: o.address,
      amount: o.amount,
      assets: (o.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
    lastUpdatedAt: tx.last_update,
    // all of these can be null
    submittedAt: tx.time,
    blockNum: tx.block_num,
    blockHash: tx.block_hash,
    txOrdinal: tx.tx_ordinal,
    epoch: tx.epoch,
    slot: tx.slot,
    withdrawals: tx.withdrawals,
    certificates: tx.certificates,
    validContract: tx.valid_contract,
    scriptSize: tx.script_size,
    collateralInputs: (tx.collateral_inputs ?? []).map((i) => ({
      address: i.address,
      amount: i.amount,
      assets: (i.assets ?? []).map((a) => ({
        amount: a.amount,
        assetId: a.assetId,
        policyId: a.policyId,
        name: a.name,
      })),
    })),
  }
}
