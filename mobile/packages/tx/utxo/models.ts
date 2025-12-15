import {
  Address,
  Amount,
  AssetName,
  Balance,
  BlockHash,
  EpochNumber,
  PolicyId,
  SlotNumber,
  TokenId,
  TransactionHash,
} from '@yoroi/types'
import {UtxoId} from '@yoroi/types'

import type {
  TransactionUnspentOutput,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {Addressing} from '../types'

// Modern UTXO type matching useUtxoList.ts pattern
export type ModernUtxo = {
  receiver: Address
  txHash: TransactionHash
  txIndex: number
  balance: Balance.Amounts // Record<TokenId, Quantity>
  derivationPath?: string // For display (BIP32 path string, e.g., "m/1852'/1815'/0'/0/0")
  addressing?: Addressing // For signing (path array + startLevel)
  toTransactionUnspentOutputHex: () => string
  toTransactionUnspentOutput: (
    wasm: WasmModuleProxy,
  ) => TransactionUnspentOutput
}

export enum UtxoApiResult {
  SUCCESS = 'SUCCESS',
  BESTBLOCK_ROLLBACK = 'BESTBLOCK_ROLLBACK',
  SAFEBLOCK_ROLLBACK = 'SAFEBLOCK_ROLLBACK',
}

export type Block = {
  number: number
  hash: BlockHash
  epochNo: EpochNumber
  slotNo: SlotNumber
}

export type UtxoAtPointRequest = {
  addresses: Address[]
  referenceBlockHash: BlockHash
}

export type UtxoDiffSincePointRequest = {
  addresses: Address[]
  untilBlockHash: BlockHash
  afterBestBlocks: BlockHash[]
}

export type Asset = {
  assetId: TokenId
  policyId: PolicyId
  name: AssetName
  amount: Amount
}

// Utxo type for storage/API (uses BigNumber for amounts)
export type Utxo = {
  utxoId: UtxoId
  txHash: TransactionHash
  txIndex: number
  receiver: Address
  amount: BigNumber
  assets: Asset[]
  blockNum: number
}

export enum DiffType {
  INPUT = 'input',
  OUTPUT = 'output',
}

export type UtxoDiffItem = {
  type: DiffType
  id: UtxoId
  amount: BigNumber
}

export type UtxoDiffItemOutput = UtxoDiffItem & {
  utxo: Utxo
}

export type UtxoDiff = {
  diffItems: Array<UtxoDiffItem | UtxoDiffItemOutput>
  reference: {
    lastFoundBestBlock: BlockHash
    lastFoundSafeBlock?: BlockHash
  }
}

export type UtxoDiffToBestBlock = {
  lastBestBlockHash: BlockHash
  spentUtxoIds: UtxoId[]
  newUtxos: Utxo[]
}

export type UtxoAtSafePoint = {
  lastSafeBlockHash: BlockHash
  utxos: Utxo[]
}

export type UtxoApiResponse<T> = {
  result: UtxoApiResult
  value?: T
}

export type TipStatusReference = {
  reference: {
    lastFoundSafeBlock: BlockHash
    lastFoundBestBlock: BlockHash
  }
}
