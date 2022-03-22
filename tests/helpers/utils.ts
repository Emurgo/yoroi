import * as pinCodeScreen from '../screenObjects/pinCode.screen'
import * as chooseLanguageScreen from '../screenObjects/chooseLanguage.screen'
import * as tosScreen from '../screenObjects/tos.screen'
import * as recoveryPhraseScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import {DEFAULT_INTERVAL, DEFAULT_TIMEOUT, SPENDING_PASSWORD, VALID_PIN} from '../constants'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'

export async function enterPinCode(pinCode: string): Promise<void> {
  for (const pinNumber of pinCode) {
    await pinCodeScreen.getPinKey(pinNumber).click()
  }
}

export async function enterPinCodeIfNecessary(pinCode: string): Promise<void> {
  try {
    await pinCodeScreen.getPinKey('1').waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL})
    await enterPinCode(pinCode)
  } catch (e) {
    // Pin pad is not shown, nothing to do
  }
}

export async function isElementChecked(element: WebdriverIO.Element): Promise<boolean> {
  await driver.setImplicitTimeout(300)
  const result = await element.getAttribute('checked')
  console.log(`Element is checked: ${result}`)

  return result === 'true'
}

export async function firstAppLaunch(appPIN: string = VALID_PIN): Promise<void> {
  await chooseLanguageScreen.chooseLanguageButton().click()
  await tosScreen.acceptToSCheckbox().click()
  await tosScreen.acceptToSButton().click()
  await enterPinCode(appPIN)
  await enterPinCode(appPIN)
  await driver.pause(500)
}

export async function hideKeyboard(): Promise<void> {
  await driver.hideKeyboard('pressKey', 'Done')
}

export async function enterRecoveryPhrase(recoveryPhrase: string[]): Promise<void> {
  await driver.waitUntil(async () => await recoveryPhraseScreen.mnemonicInputsView().isDisplayed())
  for (let index = 0; index < recoveryPhrase.length; index++) {
    await recoveryPhraseScreen.getMnemonicField(index).$('//android.widget.EditText').setValue(recoveryPhrase[index])
    // Using the KEYCODE_ENTER for Android.
    await driver.pressKeyCode(66)
  }
}

export async function enterWalletCredentials(
  walletName: string,
  password: string = SPENDING_PASSWORD,
  repeatPassword: string = SPENDING_PASSWORD,
): Promise<void> {
  await createNewWalletCredentialsScreen.walletNameEdit().click()
  await createNewWalletCredentialsScreen.walletNameEdit().addValue(walletName)
  await createNewWalletCredentialsScreen.spendingPasswordEdit().click()
  await createNewWalletCredentialsScreen.spendingPasswordEdit().addValue(password)
  await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit().click()
  await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit().addValue(repeatPassword)
  await hideKeyboard()
}
