import * as pinCodeScreen from '../screenObjects/pinCode.screen'
import * as chooseLanguageScreen from '../screenObjects/chooseLanguage.screen'
import * as tosScreen from '../screenObjects/tos.screen'
import * as recoveryPhraseScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import {
  DEFAULT_INTERVAL,
  DEFAULT_TIMEOUT,
  RestoredWallet,
  SPENDING_PASSWORD,
  VALID_PIN,
  WalletType,
} from '../constants'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'
import * as walletBottomPanel from '../screenObjects/walletBottomPanel.screen'
import * as walletHistoryScreen from '../screenObjects/walletHistory.screen'
import * as receiveScreen from '../screenObjects/receive.screen'
import * as sendScreen from '../screenObjects/send.screen'
import {getWalletButton} from '../screenObjects/myWallets.screen'
import * as errorModal from '../screenObjects/errorModal.screen'
import {expect} from 'chai'
import * as selectWalletToRestoreScreen from '../screenObjects/selectWalletToRestore.screen'
import * as recoveryPhraseInputScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import * as verifyRestoredWalletScreen from '../screenObjects/restoreWalletsScreens/verifyRestoredWallet.screen'
import * as myWalletsScreen from '../screenObjects/myWallets.screen'
import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'

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
    await driver.pause(400)
    await hideKeyboard()
    const mnemonicInput = await recoveryPhraseScreen.getMnemonicField(index).$('//android.widget.EditText')
    await mnemonicInput.setValue(recoveryPhrase[index])
    await driver.pause(200)
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

export async function enterNewValue(screenElement: any, newValue: string): Promise<void> {
  await screenElement().clearValue()
  await screenElement().addValue(newValue)
  await hideKeyboard()
}

export async function prepareIntrawalletTx(walletName: string): Promise<void> {
  const walletButton = await getWalletButton(walletName)
  await walletButton.click()
  await driver.waitUntil(async () => await walletBottomPanel.isDisplayed())
  await driver.pause(5 * 1000) // sleep for 5 seconds till the wallet is synced
  // find the "Receive" button, press receive
  await walletHistoryScreen.receiveButton().click()
  await driver.waitUntil(async () => await receiveScreen.generateNewAddressButton().isDisplayed())
  // copy address
  const receiverAddress = await receiveScreen.copyFirstUnusedAddress()
  // go back to the transactions screen
  await driver.back()
  // find the send button, press send button
  await walletHistoryScreen.sendButton().click()
  // input receiver address
  await enterNewValue(sendScreen.receiverAddressInput, receiverAddress)
  // input amount
  await enterNewValue(sendScreen.amountInput, '1')
  // wait till the Continue button is available
  await driver.pause(2000)
  // press the Continue button
  await sendScreen.continueButton().click()
}

export async function checkForErrors(): Promise<void> {
  let isErrorDisplayed
  try {
    isErrorDisplayed = await errorModal
      .errorView()
      .waitForDisplayed({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL})
  } catch (e) {
    // nothing to do, an error didn't appear
    isErrorDisplayed = false
  }

  if (isErrorDisplayed) {
    await errorModal.showErrorMessageButton().click()
    await driver.pause(200)
    expect(isErrorDisplayed, 'An error appeared').to.be.false
  }
}

export async function restoreWallet(wallet: RestoredWallet, debug: boolean = false): Promise<void> {
  if (debug) {
    await addWalletsScreen.addWalletButton().click()
  } else {
    await addWalletsScreen.addWalletTestnetButton().click()
  }
  await addWalletScreen.restoreWalletButton().click()

  if (wallet.type == WalletType.NormalWallet) {
    await selectWalletToRestoreScreen.restoreNormalWalletButton().click()
  } else if (wallet.type == WalletType.DaedalusWallet) {
    await selectWalletToRestoreScreen.restore24WordWalletButton().click()
  } else {
    throw Error(`Unknown wallet type: wallet type is ${wallet.type}`)
  }
  await enterRecoveryPhrase(wallet.phrase)
  await hideKeyboard()
  await recoveryPhraseInputScreen.restoreWalletButton().click()

  expect(await verifyRestoredWalletScreen.walletChecksumText().isDisplayed()).to.be.true
  expect(await verifyRestoredWalletScreen.walletChecksumText().getText()).to.be.equal(wallet.checksum)
  await verifyRestoredWalletScreen.continueButton().click()

  await driver.waitUntil(async () => await createNewWalletCredentialsScreen.credentialsView().isDisplayed())
  await enterWalletCredentials(wallet.name)
  await createNewWalletCredentialsScreen.continueButton().click()

  // It is necessary step, till the revamp will be done.
  // After that the Dashboard screen will be created and wallet name (or other component) will be used from there
  await enterPinCodeIfNecessary(VALID_PIN)
  await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())

  expect(
    await driver.$(`[text="${wallet.name}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
    `The "${wallet.name}" wasn't found`,
  ).to.be.true
}
