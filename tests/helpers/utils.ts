import * as pinCodeScreen from '../screenObjects/pinCode.screen'
import * as chooseLanguageScreen from '../screenObjects/chooseLanguage.screen'
import * as tosScreen from '../screenObjects/tos.screen'
import * as recoveryPhraseScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import {VALID_PIN} from '../constants'

export async function enterPinCode(pinCode: string): Promise<void> {
  for (const pinNumber of pinCode) {
    await pinCodeScreen.getPinKey(pinNumber).click()
  }
}

export async function isElementChecked(element: WebdriverIO.Element): Promise<boolean> {
  await driver.setImplicitTimeout(300)
  const result = await element.getAttribute('checked')
  console.log(`Element is checked: ${result}`)

  return result === 'true'
}

export async function firstAppLaunch(): Promise<void> {
  await chooseLanguageScreen.chooseLanguageButton().click()
  await tosScreen.acceptToSCheckbox().click()
  await tosScreen.acceptToSButton().click()
  await enterPinCode(VALID_PIN)
  await enterPinCode(VALID_PIN)
  await driver.setImplicitTimeout(500)
}

export async function hideKeyboard(): Promise<void> {
  await driver.hideKeyboard('pressKey', 'Done')
}

export async function enterRecoveryPhrase(recoveryPhrase: string[]): Promise<void> {
  const phraseLength = recoveryPhrase.length
  for (let index = 0; index < phraseLength; index++) {
    const mnemonicInput = await recoveryPhraseScreen.getMnemonicField(index)
    mnemonicInput.click()
    mnemonicInput.addValue(recoveryPhrase[index])
    driver.keys('Enter')
  }
}
