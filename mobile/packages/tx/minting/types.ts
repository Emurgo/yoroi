/**
 * Minting script type
 */
export type MintingScriptType = 'native' | 'plutus'

/**
 * Minting script (hex encoded)
 */
export type MintingScript = {
  type: MintingScriptType
  script: string // Script hex (Native Script or Plutus Script CBOR)
}

/**
 * Asset to mint
 */
export type MintAsset = {
  assetName: string // Asset name hex
  amount: string // Quantity (can be negative for burning)
}

/**
 * Mint action for a policy
 */
export type MintAction = {
  policyId: string // Policy ID (script hash)
  assets: MintAsset[] // Assets to mint under this policy
  script: MintingScript // Minting policy script
  redeemer?: string // Redeemer hex (for Plutus scripts)
  referenceScript?: {
    txHash: string
    txIndex: number
  } // Reference script UTXO (if using reference script)
}

/**
 * Minting result
 */
export type MintingResult = {
  policyId: string
  assetName: string
  amount: string
  tokenId: string // Full token ID (policyId.assetName)
}
