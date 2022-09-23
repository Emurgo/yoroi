import {join} from 'path'

export enum WalletType {
  NormalWallet,
  DaedalusWallet,
}

/**
 * @property {String} checksum wallet checksum
 * @property {String} name wallet name
 * @property {Array<String>} phrase wallet recovery phrase
 * @property {WalletType} type  a 15-word wallet or a 24-word wallet
 */
export type RestoredWallet = {
  checksum: string
  name: string
  phrase: string[]
  type: WalletType
}

export const DEFAULT_TIMEOUT = 5000
export const LEDGER_CONFIRM_TIMEOUT = 2 * 60 * 1000 // 2 minutes
export const DEFAULT_INTERVAL = 200
export const VALID_PIN = '123456'
export const WALLET_NAME = 'Testnet Wallet'
export const LEDGER_WALLET_NAME = 'Test Ledger'
export const SPENDING_PASSWORD = '1234567890'
export const APP_ID = 'com.emurgo.nightly'
export const APP_ID_PARENT = 'com.emurgo.*'
export const APP_PATH = join(process.cwd(), '/tests/app/Yoroi-Nightly.apk')
export const NORMAL_15_WORD_WALLET: RestoredWallet = {
  checksum: 'CONL-2085',
  name: 'RTW-15-word',
  phrase: [
    'ritual',
    'nerve',
    'sweet',
    'social',
    'level',
    'pioneer',
    'cream',
    'artwork',
    'material',
    'three',
    'thumb',
    'melody',
    'zoo',
    'fence',
    'east',
  ],
  type: WalletType.NormalWallet,
}
export const NORMAL_24_WORD_WALLET: RestoredWallet = {
  name: 'RTW-24-word',
  checksum: 'CCPL-3231',
  phrase: [
    'like',
    'project',
    'body',
    'tribe',
    'track',
    'wheat',
    'noble',
    'blur',
    'reflect',
    'tomorrow',
    'beach',
    'document',
    'market',
    'enforce',
    'clever',
    'submit',
    'gorilla',
    'hockey',
    'can',
    'surge',
    'fossil',
    'asthma',
    'salmon',
    'cry',
  ],
  type: WalletType.DaedalusWallet,
}

export const TEST_WALLET_ADDRESS: RestoredWallet = {
  checksum: 'EHKL-5865',
  name: 'RTW-address',
  phrase: [
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'address',
  ],
  type: WalletType.NormalWallet,
}

export const TEST_WALLET_SHARE: RestoredWallet = {
  checksum: 'JHKT-8080',
  name: 'RTW-share',
  phrase: [
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'abandon',
    'share',
  ],
  type: WalletType.NormalWallet,
}

export const ALL_TEST_WALLETS: RestoredWallet[] = [
  NORMAL_15_WORD_WALLET,
  // NORMAL_24_WORD_WALLET,
  TEST_WALLET_ADDRESS,
  TEST_WALLET_SHARE,
]
