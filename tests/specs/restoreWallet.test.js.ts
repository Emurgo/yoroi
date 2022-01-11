import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import {firstAppLaunch, hideKeyboard} from '../helpers/utils'
import {WALLET_NAME_RESTORED, RESTORED_WALLET, SPENDING_PASSWORD, DEFAULT_TIMEOUT, DEFAULT_INTERVAL} from '../constants'

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
    })
})