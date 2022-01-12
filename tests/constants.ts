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
type RestoredWallet = {
  checksum: string
  name: string
  phrase: string[]
  type: WalletType
}

export const DEFAULT_TIMEOUT = 5000
export const DEFAULT_INTERVAL = 200
export const VALID_PIN = '123456'
export const WALLET_NAME = 'Testnet Wallet'
export const WALLET_NAME_RESTORED = `Restored ${WALLET_NAME}`
export const SPENDING_PASSWORD = '1234567890'
export const APP_ID = 'com.emurgo.nightly'
export const APP_ID_PARENT = 'com.emurgo.*'
export const APP_PATH = join(process.cwd(), '/tests/app/Yoroi-Nightly.apk')
export const RESTORED_WALLETS: RestoredWallet[] = [
  {
    checksum: 'CONL-2085',
    name: '15-word',
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
  },
  {
    name: '24-word',
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
  },
]
