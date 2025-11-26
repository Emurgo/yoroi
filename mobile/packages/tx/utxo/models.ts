import {Balance} from '@yoroi/types'

import type {
  TransactionUnspentOutput,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {Addressing} from '../types'

// Modern UTXO type matching useUtxoList.ts pattern
export type ModernUtxo = {
  receiver: string
  txHash: string
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
  hash: string
  epochNo: number
  slotNo: number
}

export type UtxoAtPointRequest = {
  addresses: string[]
  referenceBlockHash: string
}

export type UtxoDiffSincePointRequest = {
  addresses: string[]
  untilBlockHash: string
  afterBestBlocks: string[]
}

export type Asset = {
  assetId: string
  policyId: string
  name: string
  amount: string
}

// Utxo type for storage/API (uses BigNumber for amounts)
export type Utxo = {
  utxoId: string
  txHash: string
  txIndex: number
  receiver: string
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
  id: string
  amount: BigNumber
}

export type UtxoDiffItemOutput = UtxoDiffItem & {
  utxo: Utxo
}

export type UtxoDiff = {
  diffItems: Array<UtxoDiffItem | UtxoDiffItemOutput>
  reference: {
    lastFoundBestBlock: string
    lastFoundSafeBlock?: string
  }
}

export type UtxoDiffToBestBlock = {
  lastBestBlockHash: string
  spentUtxoIds: string[]
  newUtxos: Utxo[]
}

export type UtxoAtSafePoint = {
  lastSafeBlockHash: string
  utxos: Utxo[]
}

export type UtxoApiResponse<T> = {
  result: UtxoApiResult
  value?: T
}

export type TipStatusReference = {
  reference: {
    lastFoundSafeBlock: string
    lastFoundBestBlock: string
  }
}
