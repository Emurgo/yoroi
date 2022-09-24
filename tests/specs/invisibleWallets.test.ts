import {enterPinCodeIfNecessary, firstAppLaunch, restoreWallet} from "../helpers/utils";
import {ALL_TEST_WALLETS, VALID_PIN} from "../constants";
import {getWalletButton} from "../screenObjects/myWallets.screen";
import * as walletHistoryScreen from "../screenObjects/walletHistory.screen";
import * as myWalletsScreen from "../screenObjects/myWallets.screen";


describe('Invisible wallets case', function () {
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

  it('Invisible wallets test', async () => {
    await enterPinCodeIfNecessary(VALID_PIN)

    for (const testWallet of ALL_TEST_WALLETS) {
      await restoreWallet(testWallet, true);
    }

    for (let i = 0; i < 10; i++) {
      for (const testWallet of ALL_TEST_WALLETS) {
        // Open wallet
        const walletButton = await getWalletButton(testWallet.name)
        await walletButton.click()

        // wait for the back button
        await driver.waitUntil(async () => await walletHistoryScreen.backButton().isDisplayed())
        // Press back
        await walletHistoryScreen.backButton().click()

        await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())
      }
    }
  })
});
