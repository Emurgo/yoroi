// @flow

import type {WalletImplementation} from '../../src/types'
import type {DefaultAsset} from '../../src/types/cardano'

export var isHaskellShelley: (walletImplementationId: string) => boolean
export var isByron: (walletImplementationId: string) => boolean
export var getDefaultAssets: () => Array<DefaultAsset>

// prettier-ignore
export var CONFIG: {
  COMMIT: string,
  NUMBERS: {
    HARD_DERIVATION_START: number,
    EPOCH_REWARD_DENOMINATOR: number,

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
  },
  CATALYST: {
    MIN_ADA: any,
    DISPLAYED_MIN_ADA: any,
  },
  HARDWARE_WALLETS: {
    LEDGER_NANO: {
      USB_MIN_SDK: number,
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
  },
  IS_TESTNET_BUILD: boolean,
}

export var isNightly: () => boolean

export var isJormun: (id: WalletImplementationId) => boolean

// prettier-ignore
type NetworkConfig = {
  NETWORK_ID: number,
  ENABLED: boolean,
  POOL_EXPLORER: string,
  PER_EPOCH_PERCENTAGE_REWARD: number,
}

type WalletConfig = {
  WALLET_IMPLEMENTATION_ID: number
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
