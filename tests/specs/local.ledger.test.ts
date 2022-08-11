import {
  checkForErrors,
  enterNewValue,
  prepareIntrawalletTx,
} from '../helpers/utils'
import {DEFAULT_INTERVAL, DEFAULT_TIMEOUT, LEDGER_CONFIRM_TIMEOUT, LEDGER_WALLET_NAME} from '../constants'
import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as chooseConnectionMethod from '../screenObjects/connectLedgerScreens/chooseConnectionMethod.screen'
import * as connectToLedgerDevice from '../screenObjects/connectLedgerScreens/connectToLedgerDevice.screen'
import * as myWalletsScreen from '../screenObjects/myWallets.screen'
import {expect} from 'chai'
import * as sendScreen from '../screenObjects/send.screen'
import * as walletHistoryScreen from '../screenObjects/walletHistory.screen'

describe('HW Ledger wallet', () => {
  it('Connect a wallet', async () => {
    await addWalletsScreen.addWalletTestnetButton().click()
    await addWalletScreen.connectLedgerWalletButton().click()
    await chooseConnectionMethod.connectWithBLEButton().click()

    await driver.waitUntil(async () => await connectToLedgerDevice.connectLedgerTitle().isDisplayed())
    await driver.waitUntil(async () => await connectToLedgerDevice.continueButton().isDisplayed())
    await connectToLedgerDevice.continueButton().click()
    await connectToLedgerDevice.allowUsingLocation().click()
    await driver.waitUntil(async () => await connectToLedgerDevice.scanningTitle().isDisplayed())
    await driver.pause(500)
    const allScrollViews = await connectToLedgerDevice.getDevices()
    await allScrollViews[allScrollViews.length - 1].$('android.view.ViewGroup').click()

    await driver.waitUntil(async () => await connectToLedgerDevice.saveWalletButton().isDisplayed())
    await enterNewValue(connectToLedgerDevice.walletNameInput, LEDGER_WALLET_NAME)
    await connectToLedgerDevice.saveWalletButton().click()
    await driver.waitUntil(async () => await myWalletsScreen.pageTitle().isDisplayed())

    expect(
      await driver
        .$(`[text="${LEDGER_WALLET_NAME}"]`)
        .waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
      `The "${LEDGER_WALLET_NAME}" wasn't found`,
    ).to.be.true
  })

  it('Send intrawallet transaction', async () => {
    await prepareIntrawalletTx(LEDGER_WALLET_NAME)
    // choose connection method
    await driver.waitUntil(async () => await chooseConnectionMethod.isDisplayed())
    await chooseConnectionMethod.connectWithBLEButton().click()
    await driver.waitUntil(async () => await sendScreen.confirmTxButton().isDisplayed())
    await sendScreen.confirmTxButton().click()

    // checking there is no errors after pressing the Confirm TX button
    await checkForErrors()

    expect(
      await walletHistoryScreen
        .sendButton()
        .waitForDisplayed({timeout: LEDGER_CONFIRM_TIMEOUT, interval: DEFAULT_INTERVAL}),
      `Wallet transactions screen is not displayed`,
    ).to.be.true
  })
})
