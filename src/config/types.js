// @flow

export const NETWORK_REGISTRY = {
  BYRON_MAINNET: 0,
  HASKELL_SHELLEY: 1,
  JORMUNGANDR: 100,
  // ERGO: 200,
  UNDEFINED: -1,
}
export type NetworkId = $Values<typeof NETWORK_REGISTRY>

export const DERIVATION_TYPES = {
  BIP44: 'bip44',
  CIP1852: 'cip1852',
}
export type DerivationType = $Values<typeof DERIVATION_TYPES>

// these are the different wallet implementations we have/had
export const WALLET_IMPLEMENTATION_REGISTRY = {
  HASKELL_BYRON: 'haskell-byron', // bip44
  HASKELL_SHELLEY: 'haskell-shelley', // cip1852
  DAEDALUS_HASKELL_SHELLEY: 'daedalus-haskell-shelley', // cip1852
  JORMUNGANDR_ITN: 'jormungandr-itn', // deprecated
  // ERGO: 'ergo',
  UNDEFINED: '',
}
export type WalletImplementationId = $Values<
  typeof WALLET_IMPLEMENTATION_REGISTRY,
>

export type WalletImplementation = {
  +WALLET_IMPLEMENTATION_ID: WalletImplementationId,
  +TYPE: DerivationType,
  +MNEMONIC_LEN: number,
  +DISCOVERY_GAP_SIZE: number,
  +DISCOVERY_BLOCK_SIZE: number,
  +MAX_GENERATED_UNUSED: number,
}

export type BackendConfig = {
  API_ROOT: string,
  FETCH_UTXOS_MAX_ADDRESSES: number,
  TX_HISTORY_MAX_ADDRESSES: number,
  FILTER_USED_MAX_ADDRESSES: number,
  TX_HISTORY_RESPONSE_LIMIT: number,
}
