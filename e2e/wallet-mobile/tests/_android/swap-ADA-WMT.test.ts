import {device, expect} from 'detox'

import * as constants from '../../general/constants'
import * as devOptionsScreen from '../../screens/devOptionsScreen.screen'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as swapScreen from '../../screens/swapMain.screen'
import * as walletHomeScreen from '../../screens/walletHome.screen'
import * as walletMenuScreen from '../../screens/walletMenuItems.screen'
import * as utils from '../../general/utils'

describe('Swap test', () => {
 // const sellToken = 'ADA'
 const buyToken = 'WMT'

 beforeAll(async () => {
  await device.launchApp({newInstance: true})
  await utils.prepareApp(constants.valid_Pin)
 })

 it('should be able to add the "default Wallet 2" from dev options', async () => {
  await myWalletsScreen.buttonDeveloperOptions().tap()
  await expect(devOptionsScreen.buttonRestoreWallet2()).toBeVisible()
  await devOptionsScreen.buttonRestoreWallet2().tap()
  await waitFor(myWalletsScreen.pageTitle()).toBeVisible().withTimeout(5000)
  await waitFor(myWalletsScreen.tabWallet('Wallet 2')).toBeVisible().withTimeout(10000)
 })

 it('should be able to open "Wallet 2"', async () => {
  await myWalletsScreen.tabWallet('Wallet 2').tap()
  await expect(walletMenuScreen.menuNFTGallery()).toBeVisible()
 })

 it('should be able to click "Swap" from wallet home and verify swap screen is displayed', async () => {
  await walletHomeScreen.swapButton().tap()
  await expect(swapScreen.inputSellQuantity()).toBeVisible()
 })

 it('should be able to enter quantities and select tokens', async () => {
  await swapScreen.inputSellQuantity().tap()
  await swapScreen.inputSellQuantity().clearText()

  await swapScreen.selectBuyToken().tap()
  await swapScreen.swapTokenName(buyToken).tap()
  await swapScreen.inputSellQuantity().typeText('2')
  await utils.delay(5000)
  await expect(swapScreen.buttonSwapAction()).toBeVisible()
  await swapScreen.buttonSwapAction().tap()
 })
})
