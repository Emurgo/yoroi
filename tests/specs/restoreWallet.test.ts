import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'
import * as selectWalletToRestoreScreen from '../screenObjects/selectWalletToRestore.screen'
import * as recoveryPhraseInputScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import * as verifyRestoredWalletScreen from '../screenObjects/restoreWalletsScreens/verifyRestoredWallet.screen'
import {firstAppLaunch, hideKeyboard, enterRecoveryPhrase, enterPinCodeIfNecessary} from '../helpers/utils'
import {
  DEFAULT_INTERVAL,
  DEFAULT_TIMEOUT,
  RESTORED_WALLETS,
  SPENDING_PASSWORD,
  VALID_PIN,
  WALLET_NAME_RESTORED,
  WalletType,
} from '../constants'

const expect = require('chai').expect

describe('Restore a wallet', () => {
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

  RESTORED_WALLETS.forEach((restoredWallet) => {
    it(`Straight happy path restoring a ${restoredWallet.name} wallet`, async () => {
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
      await enterPinCodeIfNecessary(VALID_PIN)
      await driver.pause(2000)

      expect(
        await driver.$(`[text="${walletName}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
        `The text ${walletName} wasn't found`,
      ).to.be.true
    })
  })
})
