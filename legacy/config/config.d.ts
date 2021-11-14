// @flow

export var isHaskellShelley: (walletImplementationId: string) => boolean
export var isByron: (walletImplementationId: string) => boolean
export var isNightly: () => boolean
export var isJormun: (walletImplementationId: string) => boolean

// prettier-ignore
export var CONFIG: {
  LOG_LEVEL: string,
  ANDROID_BIO_AUTH_EXCLUDED_SDK: Array<number>,
  DEBUG: {
    START_WITH_INDEX_SCREEN: boolean,
  },
  PIN_LENGTH: number,
  WALLETS: {
    HASKELL_SHELLEY: WalletConfig,
    HASKELL_BYRON: WalletConfig,
    JORMUNGANDR_ITN: WalletConfig,
  },
  NETWORKS: {
    HASKELL_SHELLEY: NetworkConfig,
    HASKELL_SHELLEY_TESTNET: NetworkConfig,
    JORMUNGANDR: NetworkConfig,
  },
  CATALYST: {
    MIN_ADA: number,
    DISPLAYED_MIN_ADA: BigNumber
  },
  IS_TESTNET_BUILD: boolean,
}

// prettier-ignore
type NetworkConfig = {
  NETWORK_ID: number,
  ENABLED: boolean
}

type WalletConfig = {
  WALLET_IMPLEMENTATION_ID: string
}
