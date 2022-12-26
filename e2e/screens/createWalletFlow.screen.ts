import { by, element } from 'detox'

export const walletNameInput = () => element(by.id('walletNameInput'))
export const spendingPasswordInput = () => element(by.id('walletPasswordInput'))
export const repeatSpendingPasswordInput = () => element(by.id('walletRepeatPasswordInput'))
export const credentialsFormContinueButton = () => element(by.id('walletFormContinueButton'))
export const mnemonicExplanationModal = () => element(by.id('mnemonicExplanationModal'))
export const mnemonicByIndexText = (index: number) => element(by.id(`mnemonic-${index}`))
export const mnemonicShowScreenConfirmButton = () => element(by.id('mnemonicShowScreen::confirm'))
export const mnemonicWarningModalCheckbox1 = () => element(by.id('mnemonicBackupImportanceModal::checkBox1'))
export const mnemonicWarningModalCheckbox2 = () => element(by.id('mnemonicBackupImportanceModal::checkBox2'))
export const mnemonicWarningModalConfirm = () => element(by.id('mnemonicBackupImportanceModal::confirm'))
export const mnemonicBadgeByWord = (word: string) => element(by.id(`wordBadgeNonTapped-${word}`)).atIndex(0)
export const mnemonicCheckScreenConfirmButton = () => element(by.id('mnemonicCheckScreen::confirm'))