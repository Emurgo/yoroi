import * as myWallets from '../screenObjects/myWallets.screen'
import * as walletBottomPanel from '../screenObjects/walletBottomPanel.screen'
import * as walletHistory from '../screenObjects/walletHistory.screen'
import * as recoveryPhraseScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import {enterNewValue, hideKeyboard} from './common.screenFunctions'
import {SPENDING_PASSWORD} from '../constants'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'

export const openWallet = async (walletName: string): Promise<void> => {
  const walletButton = await myWallets.getWalletButton(walletName)
  await walletButton.click()
  await driver.waitUntil(async () => await walletBottomPanel.isDisplayed())
  await driver.waitUntil(async () => await walletHistory.isFullyLoaded())
}

export const enterRecoveryPhrase = async (recoveryPhrase: string[]): Promise<void> => {
  await driver.waitUntil(async () => await recoveryPhraseScreen.mnemonicInputsView().isDisplayed())
  for (let index = 0; index < recoveryPhrase.length; index++) {
    await driver.pause(400)
    await hideKeyboard()
    const mnemonicInput = await recoveryPhraseScreen.getMnemonicField(index).$('//android.widget.EditText')
    await mnemonicInput.setValue(recoveryPhrase[index])
    await driver.pause(200)
    // Using the KEYCODE_ENTER for Android.
    await driver.pressKeyCode(66)
  }
}

export const repeatRecoveryPhrase = async (phraseArray: string[]): Promise<void> => {
  for (const phraseArrayWord of phraseArray) {
    const element = await driver.$(`//*[@resource-id="wordBadgeNonTapped-${phraseArrayWord}"]`)
    await element.click()
  }
}

export const enterWalletCredentials = async (
  walletName: string,
  password: string = SPENDING_PASSWORD,
  repeatPassword: string = SPENDING_PASSWORD,
): Promise<void> => {
  await enterNewValue(createNewWalletCredentialsScreen.walletNameEdit, walletName)
  await enterNewValue(createNewWalletCredentialsScreen.spendingPasswordEdit, password)
  await enterNewValue(createNewWalletCredentialsScreen.repeatSpendingPasswordEdit, repeatPassword)
}
