import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'
import * as nobodyLookingScreen from '../screenObjects/createWalletScreens/nobodyLookingNotification.screen'
import * as recoveryPhraseRememberScreen from '../screenObjects/createWalletScreens/recoveryPhraseRemember.screen'
import * as recoveryPhraseNotificationScreen from '../screenObjects/createWalletScreens/recoveryPhraseNotification.screen'
import * as recoveryPhraseEnterScreen from '../screenObjects/createWalletScreens/recoveryPhraseEnter.screen'
import * as myWalletsScreen from '../screenObjects/myWallets.screen'
import * as walletHistoryScreen from '../screenObjects/walletHistory.screen'
import * as sendScreen from '../screenObjects/send.screen'
import {
  checkForErrors,
  enterNewValue,
  enterPinCodeIfNecessary,
  enterRecoveryPhrase,
  enterWalletCredentials,
  firstAppLaunch,
  hideKeyboard,
  prepareIntrawalletTx,
} from '../helpers/utils'
import {
  WALLET_NAME,
  DEFAULT_TIMEOUT,
  DEFAULT_INTERVAL,
  VALID_PIN,
  NORMAL_15_WORD_WALLET,
  WalletType,
  SPENDING_PASSWORD,
} from '../constants'
import * as selectWalletToRestoreScreen from '../screenObjects/selectWalletToRestore.screen'
import * as recoveryPhraseInputScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import * as verifyRestoredWalletScreen from '../screenObjects/restoreWalletsScreens/verifyRestoredWallet.screen'

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
      await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())

      expect(
        await driver.$(`[text="${WALLET_NAME}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
      ).to.be.true
    })
  })

  describe('Restored wallet', () => {
    it(`Restoring ${NORMAL_15_WORD_WALLET.name} wallet`, async () => {
      await enterPinCodeIfNecessary(VALID_PIN)
      await addWalletsScreen.addWalletTestnetButton().click()
      await addWalletScreen.restoreWalletButton().click()

      if (NORMAL_15_WORD_WALLET.type == WalletType.NormalWallet) {
        await selectWalletToRestoreScreen.restoreNormalWalletButton().click()
      } else if (NORMAL_15_WORD_WALLET.type == WalletType.DaedalusWallet) {
        await selectWalletToRestoreScreen.restore24WordWalletButton().click()
      } else {
        throw Error(`Unknown wallet type: wallet type is ${NORMAL_15_WORD_WALLET.type}`)
      }
      await enterRecoveryPhrase(NORMAL_15_WORD_WALLET.phrase)
      await hideKeyboard()
      await recoveryPhraseInputScreen.restoreWalletButton().click()

      expect(await verifyRestoredWalletScreen.walletChecksumText().isDisplayed()).to.be.true
      expect(await verifyRestoredWalletScreen.walletChecksumText().getText()).to.be.equal(
        NORMAL_15_WORD_WALLET.checksum,
      )
      await verifyRestoredWalletScreen.continueButton().click()

      await driver.waitUntil(async () => await createNewWalletCredentialsScreen.credentialsView().isDisplayed())
      await enterWalletCredentials(NORMAL_15_WORD_WALLET.name)
      await createNewWalletCredentialsScreen.continueButton().click()

      // It is necessary step, till the revamp will be done.
      // After that the Dashboard screen will be created and wallet name (or other component) will be used from there
      await enterPinCodeIfNecessary(VALID_PIN)
      await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())

      expect(
        await driver
          .$(`[text="${NORMAL_15_WORD_WALLET.name}"]`)
          .waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
        `The "${NORMAL_15_WORD_WALLET.name}" wasn't found`,
      ).to.be.true
    })

    it(`Intrawallet transaction, ${NORMAL_15_WORD_WALLET.name} wallet`, async () => {
      await enterPinCodeIfNecessary(VALID_PIN)
      await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())
      await prepareIntrawalletTx(NORMAL_15_WORD_WALLET.name)
      await driver.waitUntil(async () => await sendScreen.confirmTxButton().isDisplayed())
      await enterNewValue(sendScreen.confirmSpendingPasswordInput, SPENDING_PASSWORD)
      await sendScreen.confirmTxButton().click()

      await checkForErrors()

      expect(
        await walletHistoryScreen.sendButton().waitForDisplayed({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
        `Wallet transactions screen is not displayed`,
      ).to.be.true
    })
  })
})
