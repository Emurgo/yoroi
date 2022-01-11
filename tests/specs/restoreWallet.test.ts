import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'
import * as selectWalletToRestoreScreen from '../screenObjects/selectWalletToRestore.screen'
import * as recoveryPhraseInputScreen from '../screenObjects/restoreWalletsScreens/recoveryPhraseEnterManually.screen'
import * as verifyRestoredWalletScreen from '../screenObjects/restoreWalletsScreens/verifyRestoredWallet.screen'
import {firstAppLaunch, hideKeyboard, enterRecoveryPhrase} from '../helpers/utils'
import {
  WALLET_NAME_RESTORED,
  RESTORED_WALLET,
  RESTORED_WALLET_CHECKSUM,
  SPENDING_PASSWORD,
  DEFAULT_TIMEOUT,
  DEFAULT_INTERVAL,
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

  it('Straight happy path', async () => {
    await firstAppLaunch()
    await addWalletsScreen.addWalletTestnetButton().click()
    await addWalletScreen.restoreWalletButton().click()

    await selectWalletToRestoreScreen.restoreNormalWalletButton().click()
    await enterRecoveryPhrase(RESTORED_WALLET)
    await hideKeyboard()
    await recoveryPhraseInputScreen.restoreWalletButton().click()

    expect(await verifyRestoredWalletScreen.walletChecksumText().isDisplayed()).to.be.true
    expect(await verifyRestoredWalletScreen.walletChecksumText().getText()).to.be.equal(RESTORED_WALLET_CHECKSUM)

    await createNewWalletCredentialsScreen.walletNameEdit().click()
    await createNewWalletCredentialsScreen.walletNameEdit().addValue(WALLET_NAME_RESTORED)
    await createNewWalletCredentialsScreen.spendingPasswordEdit().click()
    await createNewWalletCredentialsScreen.spendingPasswordEdit().addValue(SPENDING_PASSWORD)
    await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit().click()
    await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit().addValue(SPENDING_PASSWORD)
    await hideKeyboard()

    expect(
      await driver.$(`[text="${WALLET_NAME_RESTORED}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
    ).to.be.true
  })
})
