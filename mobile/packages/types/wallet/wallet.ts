export type WalletImplementation =
  | 'cardano-cip1852'
  | 'cardano-bip44'
  | 'cardano-multisig'

export type WalletAddressMode = 'single' | 'multiple'

/**
 * Quorum rule types for multisig wallets
 */
export type QuorumRuleKind = 'RequireAllOf' | 'RequireAnyOf' | 'RequireNOf'

export type QuorumRules =
  | {kind: 'RequireAllOf'}
  | {kind: 'RequireAnyOf'}
  | {kind: 'RequireNOf'; required: number}

/**
 * Co-signer information for multisig wallets
 */
export type CoSigner = {
  readonly name: string
  readonly sharedWalletKey: string // Bip32PublicKeyHex
}

/**
 * Multisig wallet metadata
 */
export type MultisigWalletMeta = {
  readonly coSigners: ReadonlyArray<CoSigner>
  readonly quorumRules: QuorumRules
  readonly paymentScriptCbor: string // ScriptCbor
  readonly stakingScriptCbor: string // ScriptCbor
  readonly parentWalletIds: ReadonlyArray<string> // Links to parent wallets
}
