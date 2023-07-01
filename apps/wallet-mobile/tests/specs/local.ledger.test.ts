import {DEFAULT_INTERVAL, DEFAULT_TIMEOUT, TWO_MINUTES_TIMEOUT, LEDGER_WALLET_NAME, TADA_TOKEN} from '../constants'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as chooseConnectionMethod from '../screenObjects/connectLedgerScreens/chooseConnectionMethod.screen'
import * as connectToLedgerDevice from '../screenObjects/connectLedgerScreens/connectToLedgerDevice.screen'
import * as myWalletsScreen from '../screenObjects/myWallets.screen'
import {AssertionError, expect} from 'chai'
import * as sendScreen from '../screenObjects/send.screen'
import * as walletHistoryScreen from '../screenObjects/walletHistory.screen'
import {checkForErrors, enterNewValue} from '../screenFunctions/common.screenFunctions'
import {openWallet} from '../screenFunctions/myWallet.screenFunctions'
import {
  getLatestTxTime,
  getReceiveAddress,
  waitForNewTransaction
} from '../screenFunctions/walletHistory.screenFunctions'
import {balanceAndFeeIsCalculated, prepareTransaction} from '../screenFunctions/send.screenFunctions'

describe('HW Ledger wallet', () => {
  it('Connect a wallet', async () => {
    await myWalletsScreen.addWalletTestnetButton().click()
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
    await openWallet(LEDGER_WALLET_NAME)
    const latestTxTime = await getLatestTxTime()
    const receiverAddress = await getReceiveAddress()
    await walletHistoryScreen.sendButton().click()
    await prepareTransaction(receiverAddress, TADA_TOKEN, '1')
    await driver.waitUntil(async () => await balanceAndFeeIsCalculated())
    await sendScreen.continueButton().click()
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
        .waitForDisplayed({timeout: TWO_MINUTES_TIMEOUT, interval: DEFAULT_INTERVAL}),
      `Wallet transactions screen is not displayed`,
    ).to.be.true

    try {
      await driver.waitUntil(async () => await waitForNewTransaction(latestTxTime, TWO_MINUTES_TIMEOUT))
    } catch (e) {
      throw new AssertionError('There is no new transaction')
    }
  })
})
