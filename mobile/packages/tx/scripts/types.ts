import {ScriptHash, TransactionHash} from '@yoroi/types'

/**
 * Reference script information
 */
export type ReferenceScript = {
  txHash: TransactionHash
  txIndex: number
  scriptHash: ScriptHash
  scriptType: 'native' | 'plutus'
  scriptSize: number // Size in bytes
}

/**
 * Reference script usage
 */
export type ReferenceScriptUsage = {
  referenceScript: ReferenceScript
  policyId?: string // Policy ID if used for minting
}
