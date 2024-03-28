import {by, element} from 'detox'

export const restoreNormalWalletButton = () => element(by.id('restoreNormalWalletButton'))
export const restore24WordWalletButton = () => element(by.id('restore24WordWalletButton'))
export const restoreReadOnlyWalletButton = () => element(by.id('importReadOnlyWalletButton'))

export const mnemonicInputsView = () => element(by.id('mnemonicInputsView'))
export const mnemonicByIndexInput = (wordIndex: number, platform: string) =>
 platform === 'android'
  ? element(by.type(`android.widget.EditText`)).atIndex(wordIndex)
  : element(by.id(`mnemonicInput${wordIndex}`))
export const mnemonicRestoreWalletButton = () => element(by.id('restoreButton'))

export const walletChecksumText = () => element(by.id('walletChecksum'))
export const verifyWalletContinueButton = () => element(by.id('verifyWalletContinueButton'))

export const credentialsView = () => element(by.id('credentialsView'))
export const walletNameInput = () => element(by.id('walletNameInput'))
export const spendingPasswordInput = () => element(by.id('walletPasswordInput'))
export const repeatSpendingPasswordInput = () => element(by.id('walletRepeatPasswordInput'))
export const credentialsContinueButton = () => element(by.id('walletFormContinueButton'))
