// @flow

export const NETWORK_REGISTRY = {
  BYRON_MAINNET: 0,
  HASKELL_SHELLEY: 1,
  JORMUNGANDR: 100,
  // ERGO: 200,
  UNDEFINED: -1,
}

export type NetworkId = $Values<typeof NETWORK_REGISTRY>
