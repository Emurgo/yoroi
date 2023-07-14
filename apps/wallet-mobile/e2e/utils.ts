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
  await expect(prepareScreens.chooseLanguageButton()).toBeVisible()
  await prepareScreens.chooseLanguageButton().tap()

  await expect(prepareScreens.acceptTosCheckbox()).toBeVisible()
  await prepareScreens.acceptTosCheckbox().tap()
  await expect(prepareScreens.acceptTosButton()).toBeVisible()
  await prepareScreens.acceptTosButton().tap()

  await expect(pinKeyButton('1')).toBeVisible()
  await enterPIN(VALID_PIN)
  await enterPIN(VALID_PIN)

  await expect(myWalletsScreen.pageTitle()).toBeVisible()
}
