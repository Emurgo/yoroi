import { expect } from 'detox'

import { VALID_PIN } from './constants'
import { mnemonicBadgeByWord,mnemonicByIndexText } from './screens/createWalletFlow.screen'
import * as myWalletsScreen from './screens/myWallets.screen'
import { pinKeyButton } from './screens/pinCode.screen'
import * as prepareScreens from './screens/prepareApp.screen'
import { mnemonicByIndexInput } from './screens/restoreWalletFlow.screen'

export const enterPIN = async (pin: string): Promise<void> => {
  for (const pinNumber of pin) {
    await pinKeyButton(pinNumber).tap();
  }
}

export const getSeedPhrase = async (): Promise<Array<string>> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allWords: Array<string|any> = []
  for (let i = 0; i < 15; i++) {
    const elementAttrs = await mnemonicByIndexText(i).getAttributes()
    // https://github.com/wix/Detox/issues/3179#issuecomment-1016420709
    if (!('elements' in elementAttrs )) {
      allWords.push(elementAttrs.text)
    }
  }
  return allWords
}

export const repeatSeedPhrase = async (phraseArray: string[]): Promise<void> => {
  for (const phraseArrayWord of phraseArray) {
    await mnemonicBadgeByWord(phraseArrayWord).tap()
  }
}

export const enterRecoveryPhrase = async (phraseArray: string[]): Promise<void> => {
  for (let wordIndex = 0; wordIndex < phraseArray.length; wordIndex++) {
    const wordElementInput = mnemonicByIndexInput(wordIndex);
    await wordElementInput.typeText(`${phraseArray[wordIndex]}\n`);
  }
}

export const prepareApp = async (): Promise<void> => {
  await expect(element(by.text('Select Language'))).toBeVisible()
  await expect(prepareScreens.btn_SelectLanguageEnglish()).toBeVisible() 
  await prepareScreens.btn_Next().tap()


  await expect(prepareScreens.chkbox_AcceptTos()).toBeVisible()
  await prepareScreens.chkbox_AcceptTos().tap()
  await expect(prepareScreens.btn_Accept()).toBeVisible()
  await prepareScreens.btn_Accept().tap()

  await expect(pinKeyButton('1')).toBeVisible()
  await enterPIN(VALID_PIN)
  await enterPIN(VALID_PIN)

  await expect(myWalletsScreen.pageTitle()).toBeVisible()
}
