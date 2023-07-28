import { by, element } from 'detox'

export const restoreNormalWalletButton = () => element(by.id('restoreNormalWalletButton'))
export const restore24WordWalletButton = () => element(by.id('restore24WordWalletButton'))
export const restoreReadOnlyWalletButton = () => element(by.id('importReadOnlyWalletButton'))

export const mnemonicInputsView = () => element(by.id('mnemonicInputsView'))
export const mnemonicByIndexInput = (wordIndex: number) => element(by.type(`android.widget.EditText`)).atIndex(wordIndex)
export const mnemonicRestoreWalletButton = () => element(by.id('restoreButton'))

export const walletChecksumText = () => element(by.id('walletChecksum'))
export const verifyWalletContinueButton = () => element(by.id('verifyWalletContinueButton'))

export const credentialsView = () => element(by.id('credentialsView'))
export const walletNameInput = () =>  element(by.type(`android.widget.EditText`)).atIndex(0)
export const spendingPasswordInput = () => element(by.type(`android.widget.EditText`)).atIndex(1)
export const repeatSpendingPasswordInput = () => element(by.type(`android.widget.EditText`)).atIndex(2)
export const credentialsContinueButton = () => element(by.id('walletFormContinueButton'))