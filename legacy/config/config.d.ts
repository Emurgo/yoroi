// @flow

import type {WalletImplementation, WalletImplementationId} from '../../src/types'
import type {DefaultAsset} from '../../src/types'

export var isHaskellShelley: (walletImplementationId: string) => boolean
export var isByron: (walletImplementationId: string) => boolean
export var getDefaultAssets: () => Array<DefaultAsset>
export var getCardanoDefaultAsset: () => DefaultAsset

export var DISABLE_BACKGROUND_SYNC: boolean
// prettier-ignore
export var WALLETS: {
  JORMUNGANDR_ITN: {
    WALLET_IMPLEMENTATION_ID: string
  },
  HASKELL_BYRON: {
    WALLET_IMPLEMENTATION_ID: string
  },
  HASKELL_SHELLEY: {
    WALLET_IMPLEMENTATION_ID: string
  },
  HASKELL_SHELLEY_24: {
    WALLET_IMPLEMENTATION_ID: string
  }
}

// prettier-ignore
export var CONFIG: {
  MNEMONIC_STRENGTH: number,
  ASSURANCE_LEVELS: {
      LOW: number,
      MEDIUM: number,
  },
  APP_LOCK_TIMEOUT: number,
  MAX_CONCURRENT_REQUESTS: number,
  PRIMARY_ASSET_CONSTANTS: {
    CARDANO: ""
  },
  HISTORY_REFRESH_TIME: number,
  COMMIT: string,
  NUMBERS: {
    DECIMAL_PLACES_IN_ADA: 6,
    HARD_DERIVATION_START: number,
    EPOCH_REWARD_DENOMINATOR: number,
    WALLET_TYPE_PURPOSE: {
      BIP44: number, // HARD_DERIVATION_START + 44;
      CIP1852: number, // HARD_DERIVATION_START + 1852;
    },
    ACCOUNT_INDEX: number,
    COIN_TYPES: {
      CARDANO: number, // HARD_DERIVATION_START + 1815;
    },
    HARD_DERIVATION_START: 2147483648,
    WALLET_TYPE_PURPOSE: {
      BIP44: 2147483692, // HARD_DERIVATION_START + 44;
      CIP1852: 2147485500, // HARD_DERIVATION_START + 1852;
    },
    COIN_TYPES: {
      CARDANO: 2147485463, // HARD_DERIVATION_START + 1815;
    },
    ACCOUNT_INDEX: 0,
    CHAIN_DERIVATIONS: {
      EXTERNAL: 0,
      INTERNAL: 1,
      CHIMERIC_ACCOUNT: 2,
    },
    BIP44_DERIVATION_LEVELS: {
      ROOT: 0,
      PURPOSE: 1,
      COIN_TYPE: 2,
      ACCOUNT: 3,
      CHAIN: 4,
      ADDRESS: 5,
    },
    STAKING_KEY_INDEX: 0,
  },

  DEBUG: {
    PREFILL_FORMS: boolean,
    WALLET_NAME: string,
    PASSWORD: string,
    START_WITH_INDEX_SCREEN: boolean,
    MNEMONIC1: string,
    MNEMONIC2: string,
    MNEMONIC3: string,
    START_WITH_INDEX_SCREEN: boolean,
    PREFILL_FORMS: boolean,
    PASSWORD: string,
    SEND_ADDRESS: string,
    SEND_AMOUNT: string,
    CATALYST_PIN: string,
    CATALYST_NONCE: number,
  },
  CATALYST: {
    MIN_ADA: any,
    DISPLAYED_MIN_ADA: any,
    VOTING_ROUNDS: Array< { START_DATE: string, END_DATE: string} >
  },
  HARDWARE_WALLETS: {
    LEDGER_NANO: {
      ENABLED: true,
      DEFAULT_WALLET_NAME: string,
      VENDOR: string,
      MODEL: string,
      ENABLE_USB_TRANSPORT: boolean,
      USB_MIN_SDK: number, // USB transport officially supported for Android SDK >= 24
      MIN_ADA_APP_VERSION: string,
    },
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
  },
  IS_TESTNET_BUILD: boolean,
  SENTRY: {
    DSN: string,
    ENABLE: boolean,
  }
}

export var isNightly: () => boolean

export var isJormun: (id: WalletImplementationId) => boolean

// prettier-ignore
type NetworkConfig = {
  MINIMUM_UTXO_VAL: string,
  NETWORK_ID: number,
  CHAIN_NETWORK_ID: string,
  ENABLED: boolean,
  POOL_EXPLORER: string,
  PER_EPOCH_PERCENTAGE_REWARD: number,
}

// prettier-ignore
type WalletConfig = {
  WALLET_IMPLEMENTATION_ID: WalletImplementationId,
  MAX_GENERATED_UNUSED: number,
  DISCOVERY_GAP_SIZE: number,
  DISCOVERY_BLOCK_SIZE: number,
}

export var getWalletConfigById: (walletImplementationId: string) => WalletImplementation

// prettier-ignore
export var getCardanoBaseConfig: (networkConfig: CardanoHaskellShelleyNetwork) => Array<{
  StartAt?: number,
  GenesisDate?: string,
  SlotsPerEpoch?: number,
  SlotDuration?: number,
}>

export var getDefaultAssetByNetworkId: (networkId: number) => DefaultAsset

export var UI_V2: boolean

export var SHOW_PROD_POOLS_IN_DEV: boolean

export var getTestStakingPool: (networkId: NetworkId, provider: ?YoroiProvider) => Array<string>
