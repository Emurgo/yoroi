// @flow

export var isHaskellShelley: (walletImplementationId: string) => boolean
export var isByron: (walletImplementationId: string) => boolean

// prettier-ignore
export var CONFIG: {
  DEBUG: {
    PREFILL_FORMS: boolean,
    WALLET_NAME: string,
    PASSWORD: string,
    START_WITH_INDEX_SCREEN: boolean,
  },
  HARDWARE_WALLETS: {
    LEDGER_NANO: {
      ENABLE_USB_TRANSPORT: boolean,
      ENABLED: boolean,
      DEFAULT_WALLET_NAME: string
    }
  },
  LOG_LEVEL: string,
  ANDROID_BIO_AUTH_EXCLUDED_SDK: Array<number>,
  PIN_LENGTH: number,
  WALLETS: {
    HASKELL_SHELLEY: WalletConfig,
    HASKELL_SHELLEY_24: WalletConfig,
    HASKELL_BYRON: WalletConfig,
    JORMUNGANDR_ITN: WalletConfig,
  },
  NETWORKS: {
    HASKELL_SHELLEY: NetworkConfig,
    HASKELL_SHELLEY_TESTNET: NetworkConfig,
    JORMUNGANDR: NetworkConfig,
  }
}

export var isNightly: () => boolean

// prettier-ignore
type NetworkConfig = {
  NETWORK_ID: number,
  ENABLED: boolean
}

type WalletConfig = {
  WALLET_IMPLEMENTATION_ID: number
}
