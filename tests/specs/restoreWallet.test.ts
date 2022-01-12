import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'
import * as selectWalletToRestoreScreen from '../screenObjects/selectWalletToRestore.screen'
import * as recoveryPhraseInputScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import * as verifyRestoredWalletScreen from '../screenObjects/restoreWalletsScreens/verifyRestoredWallet.screen'
import {firstAppLaunch, hideKeyboard, enterRecoveryPhrase} from '../helpers/utils'
import {
  WALLET_NAME_RESTORED,
  RESTORED_WALLETS,
  SPENDING_PASSWORD,
  DEFAULT_TIMEOUT,
  DEFAULT_INTERVAL,
} from '../constants'
import { before } from "mocha";

const expect = require('chai').expect

describe('Restore a wallet', () => {
  before(async () => {
    driver.launchApp()
    await firstAppLaunch()
    driver.closeApp()
  })

  // Execute a block of code before every tests
  beforeEach(() => {
    driver.launchApp()
  })
  // Execute a block of code after every tests
  afterEach(() => {
    driver.closeApp()
  })

  RESTORED_WALLETS.forEach((restoredWallet) => {
    it(`Straight happy path restoring a ${restoredWallet.name} wallet`, async () => {
      // await firstAppLaunch()
      const walletName = `${WALLET_NAME_RESTORED} ${restoredWallet.name}`
      await addWalletsScreen.addWalletTestnetButton().click()
      await addWalletScreen.restoreWalletButton().click()

      await selectWalletToRestoreScreen.restoreNormalWalletButton().click()
      await enterRecoveryPhrase(restoredWallet.phrase)
      await hideKeyboard()
      await recoveryPhraseInputScreen.restoreWalletButton().click()

      expect(await verifyRestoredWalletScreen.walletChecksumText().isDisplayed()).to.be.true
      expect(await verifyRestoredWalletScreen.walletChecksumText().getText()).to.be.equal(restoredWallet.checksum)
      await verifyRestoredWalletScreen.continueButton().click()

      await createNewWalletCredentialsScreen.walletNameEdit().click()
      await createNewWalletCredentialsScreen.walletNameEdit().addValue(walletName)
      await createNewWalletCredentialsScreen.spendingPasswordEdit().click()
      await createNewWalletCredentialsScreen.spendingPasswordEdit().addValue(SPENDING_PASSWORD)
      await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit().click()
      await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit().addValue(SPENDING_PASSWORD)
      await hideKeyboard()
      await createNewWalletCredentialsScreen.continueButton().click()

      // It is necessary step, till the revamp will be done.
      // After that the Dashboard screen will be created and wallet name (or other component) will be used from there
      await driver.pause(2000)

      expect(
        await driver.$(`[text="${walletName}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
      ).to.be.true
    })
  })
})
