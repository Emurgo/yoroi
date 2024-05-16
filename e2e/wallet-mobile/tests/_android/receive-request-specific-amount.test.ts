import {device, expect} from 'detox'
import jestExpect from 'expect'

import * as constants from '../../general/constants'
import * as devOptionsScreen from '../../screens/devOptionsScreen.screen'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as receiveAddressListScreen from '../../screens/receiveAddress.screen'
import * as walletHomeScreen from '../../screens/walletHome.screen'
import * as walletMenuScreen from '../../screens/walletMenuItems.screen'
import * as utils from '../../general/utils'

describe('Receive funnel test', () => {
 const requestSpecificAmountAda = '54.99'
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

 it('should be able to click "Receive" from wallet home and verify receive screen is displayed', async () => {
  await walletHomeScreen.receiveButton().tap()
  await expect(receiveAddressListScreen.modal_ok_button()).toBeVisible()
  await receiveAddressListScreen.modal_ok_button().tap()
  await expect(receiveAddressListScreen.card_addresslist('1')).toBeVisible()
 })

 it('should be able to expand the address card and request specific amount', async () => {
  await receiveAddressListScreen.card_addresslist('1').tap()
  await expect(receiveAddressListScreen.qrCodeImageAddressDetailCard()).toBeVisible()
  await receiveAddressListScreen.requestSpecificAmountLink().tap()
 })

 it('should be able to enter ADA value and click "Generate Link"', async () => {
  await receiveAddressListScreen.requestSpecificAmountInput().replaceText(requestSpecificAmountAda)
  await receiveAddressListScreen.generateLinkButton().tap()
  await expect(receiveAddressListScreen.qrCodeRequestSpecificAmount()).toBeVisible()
 })

 it('should be able to verify the qr code title and copy link', async () => {
  jestExpect(await receiveAddressListScreen.verifyAdaRequestedIsDisplayed(requestSpecificAmountAda)).toBe(true)
  await receiveAddressListScreen.requestSpecificAmountCopyLinkButton().tap()
 })
})
