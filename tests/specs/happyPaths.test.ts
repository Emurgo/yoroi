import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'
import * as nobodyLookingScreen from '../screenObjects/createWalletScreens/nobodyLookingNotification.screen'
import * as recoveryPhraseRememberScreen from '../screenObjects/createWalletScreens/recoveryPhraseRemember.screen'
import * as recoveryPhraseNotificationScreen from '../screenObjects/createWalletScreens/recoveryPhraseNotification.screen'
import * as recoveryPhraseEnterScreen from '../screenObjects/createWalletScreens/recoveryPhraseEnter.screen'
import * as chooseConnectionMethod from '../screenObjects/connectLedgerScreens/chooseConnectionMethod.screen'
import * as connectToLedgerDevice from '../screenObjects/connectLedgerScreens/connectToLedgerDevice.screen'
import * as myWalletsScreen from '../screenObjects/myWallets.screen'
import * as walletBottomPanel from '../screenObjects/walletBottomPanel.screen'
import * as walletHistoryScreen from '../screenObjects/walletHistory.screen'
import * as receiveScreen from '../screenObjects/receive.screen'
import * as sendScreen from '../screenObjects/send.screen'
import * as errorModal from '../screenObjects/errorModal.screen'
import {
  enterNewValue,
  enterPinCodeIfNecessary,
  enterRecoveryPhrase,
  enterWalletCredentials,
  firstAppLaunch,
  hideKeyboard,
} from '../helpers/utils'
import {
  WALLET_NAME,
  DEFAULT_TIMEOUT,
  DEFAULT_INTERVAL,
  VALID_PIN,
  RESTORED_WALLETS,
  WALLET_NAME_RESTORED,
  WalletType,
  LEDGER_WALLET_NAME, LEDGER_CONFIRM_TIMEOUT,
} from '../constants'
import * as selectWalletToRestoreScreen from '../screenObjects/selectWalletToRestore.screen'
import * as recoveryPhraseInputScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import * as verifyRestoredWalletScreen from '../screenObjects/restoreWalletsScreens/verifyRestoredWallet.screen'
import {getWalletButton} from "../screenObjects/myWallets.screen";

const expect = require('chai').expect

describe('Happy paths', () => {
  // Execute a block of code before every tests
  beforeEach(() => {
    driver.launchApp()
  })
  // Execute a block of code after every tests
  afterEach(() => {
    driver.closeApp()
  })

  it('Prepare the app', async () => {
    await firstAppLaunch(VALID_PIN)
  })

  describe('Creating a wallet', () => {
    it('Shelley era', async () => {
      await enterPinCodeIfNecessary(VALID_PIN)
      await addWalletsScreen.addWalletTestnetButton().click()
      await addWalletScreen.createWalletButton().click()

      await driver.waitUntil(async () => await createNewWalletCredentialsScreen.credentialsView().isDisplayed())
      await enterWalletCredentials(WALLET_NAME)
      await hideKeyboard()
      await createNewWalletCredentialsScreen.continueButton().click()

      await nobodyLookingScreen.understandButton().click()

      const allWords = await recoveryPhraseRememberScreen.getAllWords()
      await recoveryPhraseRememberScreen.writtenItDownButton().click()

      await recoveryPhraseNotificationScreen.mySecretKeyOnDeviceCheckbox().click()
      await recoveryPhraseNotificationScreen.recoveringOnlyByPhraseCheckbox().click()
      await recoveryPhraseNotificationScreen.understandButton().click()

      await recoveryPhraseEnterScreen.enterRecoveryPhrase(allWords)
      await recoveryPhraseEnterScreen.confirmButton().click()

      await enterPinCodeIfNecessary(VALID_PIN)
      await driver.pause(2000)

      expect(
        await driver.$(`[text="${WALLET_NAME}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
      ).to.be.true
    })
  })

  describe('Restoring a wallet', () => {
    RESTORED_WALLETS.forEach((restoredWallet) => {
      it(`${restoredWallet.name} wallet`, async () => {
        await enterPinCodeIfNecessary(VALID_PIN)
        const walletName = `${WALLET_NAME_RESTORED} ${restoredWallet.name}`
        await addWalletsScreen.addWalletTestnetButton().click()
        await addWalletScreen.restoreWalletButton().click()

        if (restoredWallet.type == WalletType.NormalWallet) {
          await selectWalletToRestoreScreen.restoreNormalWalletButton().click()
        } else if (restoredWallet.type == WalletType.DaedalusWallet) {
          await selectWalletToRestoreScreen.restore24WordWalletButton().click()
        } else {
          throw Error(`Unknown wallet type: wallet type is ${restoredWallet.type}`)
        }
        await enterRecoveryPhrase(restoredWallet.phrase)
        await hideKeyboard()
        await recoveryPhraseInputScreen.restoreWalletButton().click()

        expect(await verifyRestoredWalletScreen.walletChecksumText().isDisplayed()).to.be.true
        expect(await verifyRestoredWalletScreen.walletChecksumText().getText()).to.be.equal(restoredWallet.checksum)
        await verifyRestoredWalletScreen.continueButton().click()

        await driver.waitUntil(async () => await createNewWalletCredentialsScreen.credentialsView().isDisplayed())
        await enterWalletCredentials(walletName)
        await createNewWalletCredentialsScreen.continueButton().click()

        // It is necessary step, till the revamp will be done.
        // After that the Dashboard screen will be created and wallet name (or other component) will be used from there
        await enterPinCodeIfNecessary(VALID_PIN)
        await driver.pause(2000)

        expect(
          await driver.$(`[text="${walletName}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
          `The text ${walletName} wasn't found`,
        ).to.be.true
      })
    })
  })

  describe('HW wallet', () => {
    it('Connect a wallet', async () => {
      await enterPinCodeIfNecessary(VALID_PIN)
      await addWalletsScreen.addWalletTestnetButton().click()
      await addWalletScreen.connectLedgerWalletButton().click()
      await chooseConnectionMethod.connectWithBLEButton().click()

      await driver.waitUntil(async () => await connectToLedgerDevice.connectLedgerTitle().isDisplayed())
      await driver.waitUntil(async () => await connectToLedgerDevice.continueButton().isDisplayed())
      await connectToLedgerDevice.continueButton().click();
      await connectToLedgerDevice.allowUsingLocation().click();
      await driver.waitUntil(async () => await connectToLedgerDevice.scanningTitle().isDisplayed())
      await driver.pause(500)
      const allScrollViews = await connectToLedgerDevice.getDevices()
      await allScrollViews[allScrollViews.length - 1].$('android.view.ViewGroup').click()

      await driver.waitUntil(async () => await connectToLedgerDevice.saveWalletButton().isDisplayed())
      await enterNewValue(connectToLedgerDevice.walletNameInput, LEDGER_WALLET_NAME)
      await connectToLedgerDevice.saveWalletButton().click()

      expect(
          await driver.$(`[text="${LEDGER_WALLET_NAME}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
          `The text ${LEDGER_WALLET_NAME} wasn't found`,
      ).to.be.true
    })

    it('Send intrawallet transaction', async () => {
      await enterPinCodeIfNecessary(VALID_PIN)
      await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())
      const walletButton = await getWalletButton(LEDGER_WALLET_NAME);
      await walletButton.click()
      await driver.waitUntil(async () => await walletBottomPanel.isDisplayed())
      await driver.pause(5 * 1000) // sleep for 5 seconds till the wallet is synced
      // find the Receive button, press receive
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
      // choose connection method
      await driver.waitUntil(async () => await chooseConnectionMethod.isDisplayed())
      await chooseConnectionMethod.connectWithBLEButton().click()
      await driver.waitUntil(async () => await sendScreen.confirmTxButton().isDisplayed())
      await sendScreen.confirmTxButton().click()
      // checking there is no errors after pressing the Confirm TX button
      const isErrorDisplayed = await errorModal.errorView().waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL})
      if (isErrorDisplayed) {
        await errorModal.showErrorMessageButton().click()
        expect(isErrorDisplayed, 'An error appeared').to.be.false
      }
      expect(
          await walletHistoryScreen.sendButton().waitForDisplayed({timeout: LEDGER_CONFIRM_TIMEOUT, interval: DEFAULT_INTERVAL}),
          `The text ${LEDGER_WALLET_NAME} wasn't found`,
      ).to.be.true
    })
  })
})
