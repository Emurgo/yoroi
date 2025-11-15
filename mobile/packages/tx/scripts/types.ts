/**
 * Reference script information
 */
export type ReferenceScript = {
  txHash: string
  txIndex: number
  scriptHash: string
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
