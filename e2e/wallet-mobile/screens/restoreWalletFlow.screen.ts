import {by, element} from 'detox'

export const step1Title = () => element(by.text('Enter recovery phrase'))

export const mnemonicInputsView = () => element(by.id('mnemonicInputsView'))
export const mnemonicByIndexInput = (wordIndex: number, platform: string) =>
 platform === 'android'
  ? element(by.type(`android.widget.EditText`)).atIndex(wordIndex)
  : element(by.id(`mnemonicInput${wordIndex}`))

export const step1RecoveryPhraseSuccessMessage = () => element(by.text('The recovery phrase is verified'))
export const step1Clear_AllButton = () => element(by.id('clearAll-button'))
export const step1NextButton = () => element(by.id('setup-restore-step1-next-button'))

export const step2Title1OnModal = () => element(by.text('What is wallet name'))
export const step2Title2OnModal = () => element(by.text('What is password'))
export const step2ModalContinueButton = () => element(by.id('setup-modal-continue-button'))

export const walletPlateNumber = () => element(by.id('wallet-plate-number'))

export const step2WalletNameInput = () => element(by.id('walletNameInput'))
export const step2SpendingPasswordInput = () => element(by.id('walletPasswordInput'))
export const step2RepeatSpendingPasswordInput = () => element(by.id('walletRepeatPasswordInput'))
export const step2NextButton = () => element(by.id('setup-restore-step2-next-button'))

export const praparingYourWalletMessage = () => element(by.text('Preparing your wallet...'))

export const enterRecoveryPhrase = async (phraseArray: string[], platform: string): Promise<void> => {
 for (let wordIndex = 0; wordIndex < phraseArray.length; wordIndex++) {
  const wordElementInput = mnemonicByIndexInput(wordIndex, platform)
  await wordElementInput.typeText(`${phraseArray[wordIndex]}\n`)
 }
}
