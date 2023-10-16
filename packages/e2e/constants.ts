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

export const valid_Pin = '123456'
export const wallet_Name = 'New Test Wallet'
export const ledger_Wallet_Name = 'Test Ledger'
export const spending_Password = '1234567890'
export const ada_Token = 'ADA'
export const tada_Token = 'TADA'
export const stake_Pool_Id =
 'fe662c24cf56fb98626161f76d231ac50ab7b47dd83986a30c1d4796'
export const app_Id = 'com.emurgo.nightly'
export const app_Id_Parent = 'com.emurgo.*'
export const normal_15_Word_Wallet: RestoredWallet = {
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
export const normal_24_Word_Wallet: RestoredWallet = {
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
export const RESTORED_WALLETS: RestoredWallet[] = [
 normal_15_Word_Wallet,
 normal_24_Word_Wallet,
]
