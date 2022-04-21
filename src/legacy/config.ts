import {LogLevel} from '../legacy/logging'
import env from './env'
import type {DefaultAsset} from './HistoryTransaction'
import type {CardanoHaskellShelleyNetwork} from './networks'
import {
  DEFAULT_ASSETS,
  getNetworkConfigById,
  isHaskellShelleyNetwork,
  NETWORKS,
  PRIMARY_ASSET_CONSTANTS,
} from './networks'
import {NUMBERS} from './numbers'
import type {NetworkId, WalletImplementation, WalletImplementationId, YoroiProvider} from './types'
import {DERIVATION_TYPES, WALLET_IMPLEMENTATION_REGISTRY} from './types'

const IS_DEBUG = __DEV__

/** env variables & debugging flags
 *
 * WARNING: NEVER change these flags direclty here.
 * ALWAYS use the corresponding .env files.
 */
const BUILD_VARIANT = env.getString('BUILD_VARIANT')
const SHOW_INIT_DEBUG_SCREEN = env.getBoolean('SHOW_INIT_DEBUG_SCREEN', false)
const PREFILL_WALLET_INFO = !__DEV__ ? false : env.getBoolean('PREFILL_WALLET_INFO', false)
const USE_TESTNET = env.getBoolean('USE_TESTNET', false)
export const SHOW_PROD_POOLS_IN_DEV = !__DEV__ ? false : env.getBoolean('SHOW_PROD_POOLS_IN_DEV', false)
export const UI_V2 = env.getBoolean('UI_V2', false)
export const DISABLE_BACKGROUND_SYNC = !__DEV__ ? false : env.getBoolean('DISABLE_BACKGROUND_SYNC', false)

// TODO(v-almonacid): consider adding 'ENABLE' as an env variable
const SENTRY = {
  DSN: env.getString('SENTRY'),
  ENABLE: __DEV__ || BUILD_VARIANT === 'NIGHTLY',
}
const _COMMIT = env.getString('COMMIT')

const _LOG_LEVEL = IS_DEBUG ? LogLevel.Debug : LogLevel.Warn
const _ASSURANCE_STRICT = false

export const ASSURANCE_LEVELS = {
  NORMAL: {
    LOW: 3,
    MEDIUM: 9,
  },
  STRICT: {
    LOW: 5,
    MEDIUM: 15,
  },
}

const _DEFAULT_DISCOVERY_SETTINGS = {
  DISCOVERY_GAP_SIZE: 20,
  DISCOVERY_BLOCK_SIZE: 50, // should be less than API limitations
  MAX_GENERATED_UNUSED: 20, // must be <= gap size
}

export const WALLETS = {
  HASKELL_BYRON: {
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON,
    TYPE: DERIVATION_TYPES.BIP44,
    MNEMONIC_LEN: 15,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  } as WalletImplementation,
  HASKELL_SHELLEY: {
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY,
    TYPE: DERIVATION_TYPES.CIP1852,
    MNEMONIC_LEN: 15,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  } as WalletImplementation,
  HASKELL_SHELLEY_24: {
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24,
    TYPE: DERIVATION_TYPES.CIP1852,
    MNEMONIC_LEN: 24,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  } as WalletImplementation,
  JORMUNGANDR_ITN: {
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN,
    TYPE: DERIVATION_TYPES.CIP1852,
    MNEMONIC_LEN: 15,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  } as WalletImplementation,
}

const HARDWARE_WALLETS = {
  LEDGER_NANO: {
    ENABLED: true,
    DEFAULT_WALLET_NAME: 'My Ledger Wallet',
    VENDOR: 'ledger.com',
    MODEL: 'Nano',
    ENABLE_USB_TRANSPORT: true,
    USB_MIN_SDK: 24, // USB transport officially supported for Android SDK >= 24
    MIN_ADA_APP_VERSION: '2.2.1',
  },
}

const CATALYST = {
  MIN_ADA: NUMBERS.LOVELACES_PER_ADA.times(450),
  DISPLAYED_MIN_ADA: NUMBERS.LOVELACES_PER_ADA.times(500),
  VOTING_ROUNDS: [
    {
      ROUND: 4,
      START_DATE: '2021-06-03T19:00:00Z',
      END_DATE: '2021-06-10T19:00:00Z',
    },
  ],
}

export const CONFIG = {
  DEBUG: {
    // WARNING: NEVER change these flags
    START_WITH_INDEX_SCREEN: __DEV__ ? SHOW_INIT_DEBUG_SCREEN : false,
    PREFILL_FORMS: __DEV__ ? PREFILL_WALLET_INFO : false,
    WALLET_NAME: USE_TESTNET ? 'Auto Testnet' : 'Auto Nightly',
    PASSWORD: '1234567890',
    MNEMONIC1: ['dry balcony arctic what garbage sort', 'cart shine egg lamp manual bottom', 'slide assault bus'].join(
      ' ',
    ),
    MNEMONIC2: [
      'able grunt edge report orange wide',
      'amount decrease congress flee smile impulse',
      'parade perfect normal',
    ].join(' '),
    MNEMONIC3: [
      'make exercise taxi asset',
      'reject seek brain volcano roof',
      'boss already cement scrub',
      'nut priority',
    ].join(' '),
    SEND_ADDRESS: USE_TESTNET
      ? 'addr_test1qpaufs29emf7r62prt8r0l072nuvs4vezrgve2ty5csvvjwr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qj8n0y9'
      : 'addr1q8dewyn53xdjyzu20xjj6wg7kkxyqq63upxqevt24jga8fgcdwap96xuy84apchhj8u6r7uvl974sy9qz0sedc7ayjks3sxz7a',
    SEND_AMOUNT: USE_TESTNET ? '3.3333' : '1',
    POOL_HASH: 'af22f95915a19cd57adb14c558dcc4a175f60c6193dc23b8bd2d8beb',
    PUB_KEY:
      '42cfdc53da2220ba52ce62f8e20ab9bb99857a3fceacf43d676d7987ad909b53' +
      'ed75534e0d0ee8fce835eb2e7c67c5caec18a9c894388d9a046380edebbfc46d',
    CATALYST_PIN: '1234',
    CATALYST_NONCE: 1234,
  },
  E2E: {
    // WARNING: NEVER change these flags here, use .env.e2e
    // we test release configurations so we allow this flag when __DEV__=false
    IS_TESTING: BUILD_VARIANT === 'E2E',
  },
  BUILD_VARIANT,
  IS_TESTNET_BUILD: BUILD_VARIANT === 'STAGING',
  MAX_CONCURRENT_REQUESTS: 8,
  SENTRY,
  MNEMONIC_STRENGTH: 160,
  ASSURANCE_LEVELS: _ASSURANCE_STRICT ? ASSURANCE_LEVELS.STRICT : ASSURANCE_LEVELS.NORMAL,
  HISTORY_REFRESH_TIME: 25 * 1000,
  NUMBERS,
  WALLETS,

  NETWORKS: USE_TESTNET
    ? {
        ...NETWORKS,
        HASKELL_SHELLEY: NETWORKS.HASKELL_SHELLEY_TESTNET,
      }
    : {
        ...NETWORKS,
        HASKELL_SHELLEY: NETWORKS.HASKELL_SHELLEY,
      },
  PRIMARY_ASSET_CONSTANTS,
  HARDWARE_WALLETS,
  CATALYST,
  PIN_LENGTH: 6,
  APP_LOCK_TIMEOUT: 120 * 1000,
  LOG_LEVEL: _LOG_LEVEL,
  COMMIT: _COMMIT,
  // added next SDKs till update bridge, 31 there are installations already
  ANDROID_BIO_AUTH_EXCLUDED_SDK: [29, 30, 32, 33],
}

// Staking pools for testing/nightly deploys
const TESTNET_STAKING_POOLS_BY_PROVIDER = new Map<YoroiProvider, Array<string>>([
  ['emurgo-alonzo', ['03868bffac073e46cfeca68486ce8c8cdb5e3bf2677f63f2954e9cae']],
])
const TESTNET_STAKING_POOLS_BY_NETWORK = new Map<NetworkId, Array<string>>([
  [NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID, ['26b17b78de4f035dc0bfce60d1d3c3a8085c38dcce5fb8767e518bed']],
])

/**
 * queries related to wallet parameters
 */

export const isByron = (id: WalletImplementationId): boolean => id === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON

export const isHaskellShelley = (id: WalletImplementationId): boolean =>
  id === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY || id === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24

export const isJormun = (id: WalletImplementationId): boolean => id === WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN

export const getWalletConfigById = (id: WalletImplementationId): WalletImplementation => {
  const idx = Object.values(WALLET_IMPLEMENTATION_REGISTRY).indexOf(id)
  const walletKey = Object.keys(WALLET_IMPLEMENTATION_REGISTRY)[idx]
  if (walletKey != null && walletKey !== 'UNDEFINED' && WALLETS[walletKey] != null) {
    return WALLETS[walletKey]
  }
  throw new Error('invalid walletImplementationId')
}

export const isNightly = () => CONFIG.BUILD_VARIANT === 'NIGHTLY'

// need to accomodate base config parameters as required by certain API shared
// by yoroi extension and yoroi mobile
export const getCardanoBaseConfig = (
  networkConfig: CardanoHaskellShelleyNetwork,
): Array<{
  StartAt?: number
  GenesisDate?: string
  SlotsPerEpoch?: number
  SlotDuration?: number
}> => [
  {
    StartAt: networkConfig.BASE_CONFIG[0].START_AT,
    GenesisDate: networkConfig.BASE_CONFIG[0].GENESIS_DATE,
    SlotsPerEpoch: networkConfig.BASE_CONFIG[0].SLOTS_PER_EPOCH,
    SlotDuration: networkConfig.BASE_CONFIG[0].SLOT_DURATION,
  },
  {
    StartAt: networkConfig.BASE_CONFIG[1].START_AT,
    SlotsPerEpoch: networkConfig.BASE_CONFIG[1].SLOTS_PER_EPOCH,
    SlotDuration: networkConfig.BASE_CONFIG[1].SLOT_DURATION,
  },
]

const _asToken = (asset): DefaultAsset => ({
  networkId: asset.NETWORK_ID,
  identifier: asset.IDENTIFIER,
  isDefault: asset.IS_DEFAULT,
  metadata: {
    type: asset.METADATA.TYPE,
    policyId: asset.METADATA.POLICY_ID,
    assetName: asset.METADATA.ASSET_NAME,
    ticker: asset.METADATA.TICKER,
    longName: asset.METADATA.LONG_NAME,
    numberOfDecimals: asset.METADATA.NUMBER_OF_DECIMALS,
    maxSupply: asset.METADATA.MAX_SUPPLY,
  },
})

export const getDefaultAssets = (): Array<DefaultAsset> => DEFAULT_ASSETS.map((asset) => _asToken(asset))

/**
 * note: this returns the default asset according to the build variant, ie.
 * ADA for production builds, including nightly, and TADA for staing
 */
export const getCardanoDefaultAsset = (): DefaultAsset => {
  const assetData = DEFAULT_ASSETS.filter((network) => {
    const config = getNetworkConfigById(network.NETWORK_ID)
    return config.IS_MAINNET !== CONFIG.IS_TESTNET_BUILD && isHaskellShelleyNetwork(network.NETWORK_ID)
  })[0]
  return _asToken(assetData)
}

export const getDefaultAssetByNetworkId = (networkId: NetworkId): DefaultAsset => {
  const defaultAssets = DEFAULT_ASSETS.filter((asset) => asset.NETWORK_ID === networkId)
  if (defaultAssets.length === 0) {
    throw new Error(`No default assset found for network id ${networkId}`)
  }
  if (defaultAssets.length > 1) {
    throw new Error('only one default assset currently supported')
  }
  const assetData = defaultAssets[0]
  return _asToken(assetData)
}

/**
 * @description It will search for the staking pools of the testnets
 * @param  {NetworkId} networkId
 * @param  {YoroiProvider} provider
 * @returns  Array<string>
 */
export const getTestStakingPool = (networkId: NetworkId, provider: null | undefined | YoroiProvider): Array<string> => {
  if (isHaskellShelleyNetwork(networkId)) {
    if (provider) {
      return TESTNET_STAKING_POOLS_BY_PROVIDER.get(provider) || []
    }
    return TESTNET_STAKING_POOLS_BY_NETWORK.get(networkId) || []
  }
  return []
}
