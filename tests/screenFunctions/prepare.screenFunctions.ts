import {APP_LOADING_TIMEOUT, DEFAULT_INTERVAL, DEFAULT_TIMEOUT, VALID_PIN} from '../constants'
import * as chooseLanguageScreen from '../screenObjects/chooseLanguage.screen'
import * as tosScreen from '../screenObjects/tos.screen'
import * as myWallets from '../screenObjects/myWallets.screen'
import * as pinCodeScreen from '../screenObjects/pinCode.screen'

export const prepareAppIfNecessary = async (appPIN: string = VALID_PIN): Promise<void> => {
  try {
    await chooseLanguageScreen
      .chooseLanguageButton()
      .waitForExist({timeout: APP_LOADING_TIMEOUT, interval: DEFAULT_INTERVAL})
    await firstAppLaunch(appPIN)
  } catch (e) {
    // There is no "Choose language" button, nothing to do
  }
}

export const firstAppLaunch = async (appPIN: string = VALID_PIN): Promise<void> => {
  await chooseLanguageScreen.chooseLanguageButton().click()
  await tosScreen.acceptToSCheckbox().click()
  await tosScreen.acceptToSButton().click()
  await enterPinCode(appPIN)
  await enterPinCode(appPIN)
  await driver.waitUntil(async () => await myWallets.isDisplayed())
}

export const enterPinCode = async (pinCode: string): Promise<void> => {
  for (const pinNumber of pinCode) {
    await pinCodeScreen.getPinKey(pinNumber).click()
  }
}

export const enterPinCodeIfNecessary = async (pinCode: string): Promise<void> => {
  try {
    await pinCodeScreen.getPinKey('1').waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL})
    await enterPinCode(pinCode)
  } catch (e) {
    // Pin pad is not shown, nothing to do
  }
}
