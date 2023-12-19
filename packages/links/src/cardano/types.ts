import {Links} from '@yoroi/types'

// CIP99 - v1
export interface LinksCardanoClaimV1 extends Links.UriConfig {
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
export interface LinksCardanoLegacyTransfer extends Links.UriConfig {
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

export type LinksCardanoUriConfig =
  | LinksCardanoClaimV1
  | LinksCardanoLegacyTransfer
