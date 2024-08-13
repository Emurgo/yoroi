import {Balance} from '@yoroi/types'

import {DefaultAsset} from '../../../types'
import {COIN_TYPE, COINS_PER_UTXO_WORD, KEY_DEPOSIT, MINIMUM_UTXO_VAL, POOL_DEPOSIT} from '../common'

export * from '../common'

export const NETWORK_ID = 300
export const API_ROOT = 'https://preprod-backend.yoroiwallet.com/api'
export const TOKEN_INFO_SERVICE = 'https://stage-cdn.yoroiwallet.com'

export const BACKEND = {
  API_ROOT,
  NFT_STORAGE_URL: 'https://validated-nft-images.s3.amazonaws.com',
  TOKEN_INFO_SERVICE,
  FETCH_UTXOS_MAX_ADDRESSES: 50,
  TX_HISTORY_MAX_ADDRESSES: 50,
  FILTER_USED_MAX_ADDRESSES: 50,
  TX_HISTORY_RESPONSE_LIMIT: 50,
} as const
export const CHAIN_NETWORK_ID = 0

export const PROTOCOL_MAGIC = 1097911063

export const BYRON_BASE_CONFIG = {
  // byron-era
  PROTOCOL_MAGIC,
  // aka byron network id
  START_AT: 0,
  GENESIS_DATE: '1563999616000',
  SLOTS_PER_EPOCH: 21600,
  SLOT_DURATION: 20,
} as const
export const SHELLEY_BASE_CONFIG = {
  // shelley-era
  START_AT: 74,
  SLOTS_PER_EPOCH: 432000,
  SLOT_DURATION: 1,
} as const

const CARDANO_BASE_CONFIG = [BYRON_BASE_CONFIG, SHELLEY_BASE_CONFIG]
export const NETWORK_CONFIG = {
  BACKEND,
  BASE_CONFIG: CARDANO_BASE_CONFIG,
  CHAIN_NETWORK_ID: CHAIN_NETWORK_ID.toString(),
  COIN_TYPE,
  ENABLED: true,
  EXPLORER_URL_FOR_ADDRESS: (address: string) => `https://preprod.cardanoscan.io/address/${address}`,
  EXPLORER_URL_FOR_TOKEN: (fingerprint: string) =>
    fingerprint.length > 0
      ? `https://preprod.cardanoscan.io/token/${fingerprint}`
      : `https://preprod.cardanoscan.io/tokens`,
  CEXPLORER_URL_FOR_TOKEN: (fingerprint: string) =>
    fingerprint.length > 0 ? `https://preprod.cexplorer.io/asset/${fingerprint}` : `https://preprod.cexplorer.io/asset`,
  EXPLORER_URL_FOR_TX: (txid: string) => `https://preprod.cardanoscan.io/transaction/${txid}`,
  POOL_EXPLORER: 'https://adapools.yoroiwallet.com/?source=mobile',
  KEY_DEPOSIT,
  MARKETING_NAME: 'Cardano testnet',
  MINIMUM_UTXO_VAL,
  NETWORK_ID,
  PER_EPOCH_PERCENTAGE_REWARD: 69344,
  POOL_DEPOSIT,
  PROVIDER_ID: 300,
  COINS_PER_UTXO_WORD,
} as const

export const PRIMARY_TOKEN_INFO: Balance.TokenInfo = {
  id: '.',
  name: 'TADA',
  description: 'Cardano',
  fingerprint: '',
  kind: 'ft',
  group: '',
  icon: '',
  ticker: 'TADA',
  image: '',
  decimals: 6,
  symbol: '₳',
  metadatas: {},
} as const

export const PRIMARY_TOKEN: DefaultAsset = {
  identifier: '.',
  networkId: CHAIN_NETWORK_ID,
  isDefault: true,
  metadata: {
    type: 'Cardano',
    policyId: '',
    assetName: '',
    numberOfDecimals: 6,
    ticker: 'TADA',
    longName: null,
    maxSupply: '45000000000000000',
  },
} as const
