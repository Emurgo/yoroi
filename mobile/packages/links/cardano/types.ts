import {Links} from '@yoroi/types'

// CIP99 - v1
export type LinksCardanoClaimV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'claim'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['code', 'faucet_url']>
    readonly optionalParams: Readonly<[]>
    readonly forbiddenParams: Readonly<['address']>
    readonly extraParams: 'include'
  }
}

// CIP13 - initial version
// @deprecated Use LinksCardanoPayV1 instead
// LEGACY COMPATIBILITY: Kept for backward compatibility
export type LinksCardanoLegacyTransfer = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: '' // is the wallet address
  readonly version: '' // unsupported
  readonly rules: {
    readonly requiredParams: Readonly<['address']>
    readonly optionalParams: Readonly<['amount', 'memo', 'message']> // message - it must be str max 54 chars/array of it
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// CIP-158 Browse
export type LinksCardanoBrowseV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'browse'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['scheme', 'namespaced_domain']>
    readonly optionalParams: Readonly<['app_path', 'url']> // url is reconstructed
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'include' // Query params passed through
  }
}

// CIP-PR843 Pay (replaces legacy transfer)
export type LinksCardanoPayV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'pay'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['address']>
    readonly optionalParams: Readonly<['amount', 'asset', 'memo']>
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// CIP-13 Payment
export type LinksCardanoPaymentV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'payment'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['address']>
    readonly optionalParams: Readonly<['amount', 'asset', 'memo']>
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// CIP-13 Stake
export type LinksCardanoStakeV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'stake'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['pool']>
    readonly optionalParams: Readonly<[]>
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// DRep Delegation (similar to CIP-13 Stake but for governance)
export type LinksCardanoDrepV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'drep'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['drep']>
    readonly optionalParams: Readonly<[]>
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// CIP-107 Transaction
export type LinksCardanoTransactionV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'transaction'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['hash']>
    readonly optionalParams: Readonly<[]>
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// CIP-107 Block
// Note: Requires either 'hash' or 'height' (validated at runtime)
export type LinksCardanoBlockV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'block'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<[]>
    readonly optionalParams: Readonly<['hash', 'height']>
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// CIP-134 Address
export type LinksCardanoAddressV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'address'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['address']>
    readonly optionalParams: Readonly<[]>
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// P2P Connect (new, follows CIP-158 pattern)
export type LinksCardanoConnectV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'connect'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['dappPeer']>
    readonly optionalParams: Readonly<['host', 'port', 'path', 'secure']>
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

// Wallet authority (new, follows CIP-158 pattern)
// Allows restoring wallets from links/QR codes
export type LinksCardanoWalletV1 = Links.WebCardanoUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority: 'wallet'
  readonly version: 'v1'
  readonly rules: {
    readonly requiredParams: Readonly<['type']> // 'full' | 'readonly' | 'multisig'
    readonly optionalParams: Readonly<
      [
        'mnemonic', // For full wallets: mnemonic phrase (space-separated)
        'rootKey', // For full wallets: root private key hex
        'accountPubKey', // For read-only: account public key hex
        'encryption', // Encryption algorithm identifier (future: 'plain' | 'aes-256-gcm' | ...)
        'name', // Wallet name suggestion
        'implementation', // Wallet implementation hint
        'addressMode', // Address mode hint
        'accountVisual', // Account visual index
        'multisigSetup', // For multisig wallets: base64-encoded multisig wallet setup JSON
      ]
    >
    readonly forbiddenParams: Readonly<[]>
    readonly extraParams: 'drop'
  }
}

export type LinksCardanoUriConfig =
  | LinksCardanoClaimV1
  | LinksCardanoLegacyTransfer
  | LinksCardanoBrowseV1
  | LinksCardanoPayV1
  | LinksCardanoPaymentV1
  | LinksCardanoStakeV1
  | LinksCardanoDrepV1
  | LinksCardanoTransactionV1
  | LinksCardanoBlockV1
  | LinksCardanoAddressV1
  | LinksCardanoConnectV1
  | LinksCardanoWalletV1
