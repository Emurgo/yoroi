import {by, element} from 'detox'

export const step1Title = () => element(by.text('About recovery phrase'))
export const step1TextToValidate = () =>
 element(by.text('You are the only person who knows and stores your Recovery phrase'))
export const step1NextButton = () => element(by.id('setup-step1-next-button'))
export const step2TextToValidate1 = () => element(by.text('How to save your recovery phrase?'))
export const step2TextToValidate2 = () =>
 element(by.text('DO NOT share the recovery phrase as this will allow anyone to access your assets and wallet.'))
export const step2ContinueButton = () => element(by.id('setup-step2-continue-button'))
export const step2InfoIcon = () => element(by.id('step2-info-icon'))
export const step2ShowRecoveryPhraseButton = () => element(by.id('step2-show_hide-recovery-phrase-button'))
export const step2NextButton = () => element(by.id('setup-step2-next-button'))

export const mnemonicByIndexText = (index: number) => element(by.id(`mnemonic-${index}`))

export const mnemonicBadgeByWord = (word: string) => element(by.id(`wordBadgeNonTapped-${word}`)).atIndex(0)

export const getSeedPhrase = async (): Promise<Array<string>> => {
 const allWords: Array<string | any> = []
 for (let i = 0; i < 15; i++) {
  const elementAttrs = await mnemonicByIndexText(i).getAttributes()
  if (!('elements' in elementAttrs)) {
   allWords.push(elementAttrs.label?.split('. ')[1])
  }
 }
 return allWords
}

export const step3NextButton = () => element(by.id('setup-next-button'))

export const repeatSeedPhrase = async (phraseArray: string[]): Promise<void> => {
 for (const phraseArrayWord of phraseArray) {
  await mnemonicBadgeByWord(phraseArrayWord).tap()
 }
}
export const step3RecoveryPhraseValidatedText = () => element(by.text('The recovery phrase is verified'))

export const step4Title1OnModal = () => element(by.text('What is wallet name'))
export const step4Title2OnModal = () => element(by.text('What is password'))
export const step4ModalContinueButton = () => element(by.id('setup-modal-continue-button'))

export const step4WalletNameInput = () => element(by.id('walletNameInput'))
export const step4SpendingPasswordInput = () => element(by.id('walletPasswordInput'))
export const step4RepeatSpendingPasswordInput = () => element(by.id('walletRepeatPasswordInput'))
export const step4NextButton = () => element(by.id('walletFormContinueButton'))

export const praparingYourWalletMessage = () => element(by.text('Preparing your wallet...'))
