// @flow
import {NUMBERS} from './numbers'
import {
  NETWORKS,
  DEFAULT_ASSETS,
  getNetworkConfigById,
  isHaskellShelleyNetwork,
} from './networks'
import {WALLET_IMPLEMENTATION_REGISTRY, DERIVATION_TYPES} from './types'
import {LogLevel} from '../utils/logging'
import env from '../env'

import type {WalletImplementation, WalletImplementationId} from './types'

const IS_DEBUG = __DEV__
/** debugging flags
 *
 * WARNING: NEVER change these flags direclty here.
 * ALWAYS use the corresponding .env files.
 */
const _SHOW_INIT_DEBUG_SCREEN = env.getBoolean('SHOW_INIT_DEBUG_SCREEN', false)
const _PREFILL_WALLET_INFO = env.getBoolean('PREFILL_WALLET_INFO', false)
// e2e testing
const _IS_TESTING = env.getBoolean('IS_TESTING', false)
const _USE_TESTNET = env.getBoolean('USE_TESTNET', false)

// TODO(v-almonacid): consider adding 'ENABLE' as an env variable
const _SENTRY = {
  DSN: env.getString('SENTRY'),
  ENABLE: false,
}

const _LOG_LEVEL = IS_DEBUG ? LogLevel.Debug : LogLevel.Warn
const _ASSURANCE_STRICT = false

const _COMMIT = env.getString('COMMIT')

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
  HASKELL_BYRON: ({
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON,
    TYPE: DERIVATION_TYPES.BIP44,
    MNEMONIC_LEN: 15,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  }: WalletImplementation),
  HASKELL_SHELLEY: ({
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY,
    TYPE: DERIVATION_TYPES.CIP1852,
    MNEMONIC_LEN: 15,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  }: WalletImplementation),
  HASKELL_SHELLEY_24: ({
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24,
    TYPE: DERIVATION_TYPES.CIP1852,
    MNEMONIC_LEN: 24,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  }: WalletImplementation),
  JORMUNGANDR_ITN: ({
    WALLET_IMPLEMENTATION_ID: WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN,
    TYPE: DERIVATION_TYPES.CIP1852,
    MNEMONIC_LEN: 15,
    ..._DEFAULT_DISCOVERY_SETTINGS,
  }: WalletImplementation),
}

const HARDWARE_WALLETS = {
  LEDGER_NANO: {
    ENABLED: true,
    DEFAULT_WALLET_NAME: 'My Ledger Wallet',
    VENDOR: 'ledger.com',
    MODEL: 'Nano',
    ENABLE_USB_TRANSPORT: true,
    USB_MIN_SDK: 24, // USB transport officially supported for Android SDK >= 24
    MIN_ADA_APP_VERSION: '2.1.0',
  },
}

export const CONFIG = {
  DEBUG: {
    // WARNING: NEVER change these flags
    START_WITH_INDEX_SCREEN: __DEV__ ? _SHOW_INIT_DEBUG_SCREEN : false,
    PREFILL_FORMS: __DEV__ ? _PREFILL_WALLET_INFO : false,
    WALLET_NAME: 'My wallet',
    PASSWORD: 'aeg?eP3M:)(:',
    MNEMONIC1: [
      'dry balcony arctic what garbage sort',
      'cart shine egg lamp manual bottom',
      'slide assault bus',
    ].join(' '),
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
    SEND_ADDRESS:
      'addr1q8dewyn53xdjyzu20xjj6wg7kkxyqq63upxqevt24jga8f' +
      'gcdwap96xuy84apchhj8u6r7uvl974sy9qz0sedc7ayjks3sxz7a',
    SEND_AMOUNT: '1',
    POOL_HASH: 'af22f95915a19cd57adb14c558dcc4a175f60c6193dc23b8bd2d8beb',
    PUB_KEY:
      '42cfdc53da2220ba52ce62f8e20ab9bb99857a3fceacf43d676d7987ad909b53' +
      'ed75534e0d0ee8fce835eb2e7c67c5caec18a9c894388d9a046380edebbfc46d',
  },
  E2E: {
    // WARNING: NEVER change these flags here, use .env.e2e
    // we test release configurations so we allow this flag when __DEV__=false
    IS_TESTING: _IS_TESTING,
  },
  IS_TESTNET_BUILD: _USE_TESTNET,
  MAX_CONCURRENT_REQUESTS: 5,
  SENTRY: _SENTRY,
  MNEMONIC_STRENGTH: 160,
  ASSURANCE_LEVELS: _ASSURANCE_STRICT
    ? ASSURANCE_LEVELS.STRICT
    : ASSURANCE_LEVELS.NORMAL,
  HISTORY_REFRESH_TIME: 10 * 1000,
  NUMBERS,
  WALLETS,
  // prettier-ignore
  NETWORKS: _USE_TESTNET
    ? {
      ...NETWORKS,
      HASKELL_SHELLEY: NETWORKS.HASKELL_SHELLEY_TESTNET,
    }
    : {
      ...NETWORKS,
      HASKELL_SHELLEY: NETWORKS.HASKELL_SHELLEY,
    },
  HARDWARE_WALLETS,
  PIN_LENGTH: 6,
  APP_LOCK_TIMEOUT: 120 * 1000,
  LOG_LEVEL: _LOG_LEVEL,
  COMMIT: _COMMIT,
}

/**
 * queries related to wallet parameters
 */

export const isByron = (id: WalletImplementationId): boolean =>
  id === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON

export const isHaskellShelley = (id: WalletImplementationId): boolean =>
  id === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY ||
  id === WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24

export const getWalletConfigById = (
  id: WalletImplementationId,
): WalletImplementation => {
  const idx = Object.values(WALLET_IMPLEMENTATION_REGISTRY).indexOf(id)
  const walletKey = Object.keys(WALLET_IMPLEMENTATION_REGISTRY)[idx]
  if (
    walletKey != null &&
    walletKey !== 'UNDEFINED' &&
    WALLETS[walletKey] != null
  ) {
    return WALLETS[walletKey]
  }
  throw new Error('invalid walletImplementationId')
}

// need to accomodate base config parameters as required by certain API shared
// by yoroi extension and yoroi mobile
export const getCardanoBaseConfig = (): Array<{
  StartAt?: number,
  GenesisDate?: string,
  SlotsPerEpoch?: number,
  SlotDuration?: number,
}> => [
  {
    StartAt: CONFIG.NETWORKS.HASKELL_SHELLEY.BASE_CONFIG[0].START_AT,
    GenesisDate: CONFIG.NETWORKS.HASKELL_SHELLEY.BASE_CONFIG[0].GENESIS_DATE,
    SlotsPerEpoch:
      CONFIG.NETWORKS.HASKELL_SHELLEY.BASE_CONFIG[0].SLOTS_PER_EPOCH,
    SlotDuration: CONFIG.NETWORKS.HASKELL_SHELLEY.BASE_CONFIG[0].SLOT_DURATION,
  },
  {
    StartAt: CONFIG.NETWORKS.HASKELL_SHELLEY.BASE_CONFIG[1].START_AT,
    SlotsPerEpoch:
      CONFIG.NETWORKS.HASKELL_SHELLEY.BASE_CONFIG[1].SLOTS_PER_EPOCH,
    SlotDuration: CONFIG.NETWORKS.HASKELL_SHELLEY.BASE_CONFIG[1].SLOT_DURATION,
  },
]

export const getCardanoDefaultAsset = () => {
  const assetData = DEFAULT_ASSETS.filter((network) => {
    const config = getNetworkConfigById(network.NETWORK_ID)
    return (
      config.IS_MAINNET !== CONFIG.IS_TESTNET_BUILD &&
      isHaskellShelleyNetwork(network.NETWORK_ID)
    )
  })[0]
  return {
    networkId: assetData.NETWORK_ID,
    identifier: assetData.IDENTIFIER,
    isDefault: assetData.IS_DEFAULT,
    metadata: {
      type: assetData.METADATA.TYPE,
      policyId: assetData.METADATA.POLICY_ID,
      assetName: assetData.METADATA.ASSET_NAME,
      ticker: assetData.METADATA.TICKER,
      longName: assetData.METADATA.LONG_NAME,
      numberOfDecimals: assetData.METADATA.NUMBER_OF_DECIMALS,
    },
  }
}
