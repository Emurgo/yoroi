import {device, expect} from 'detox'

import * as constants from '../../general/constants'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as swapScreen from '../../screens/swapMain.screen'
import * as walletHomeScreen from '../../screens/walletHome.screen'
import * as createWalletFlow from '../../screens/createWalletFlow.screen'
import * as utils from '../../general/utils'
import * as walletMenuScreen from '../../screens/walletMenuItems.screen'

describe('Swap test', () => {
 // const sellToken = 'ADA'
 const buyToken = 'ADAMOON'
 let seedPhraseText: string[]

 beforeAll(async () => {
  await device.launchApp({newInstance: true})
  await utils.prepareApp(constants.valid_Pin)
 })

 it('should be able to initiate the "create wallet" process form the home screen', async () => {
  await myWalletsScreen.addWalletMainnetButton().tap()
  await myWalletsScreen.createWalletButton().tap()
 })

 it('should be able to set the spending password', async () => {
  await expect(createWalletFlow.credentialsView()).toBeVisible()
  await createWalletFlow.walletNameInput().typeText(constants.wallet_Name)
  await device.disableSynchronization()
  await createWalletFlow.spendingPasswordInput().tap()
  await utils.delay(1000)
  await createWalletFlow.spendingPasswordInput().typeText(`${constants.spending_Password}\n`)
  await utils.delay(1000)
  await createWalletFlow.repeatSpendingPasswordInput().typeText(`${constants.spending_Password}\n`)
  await device.enableSynchronization()

  await createWalletFlow.credentialsFormContinueButton().tap()
  await expect(createWalletFlow.mnemonicExplanationModal()).toBeVisible()
  await createWalletFlow.mnemonicExplanationModal().tap()
 })

 it('should be able to capture the menmoic displayed and proceed', async () => {
  seedPhraseText = await utils.getSeedPhrase()
  await createWalletFlow.mnemonicShowScreenConfirmButton().tap()
  await expect(createWalletFlow.mnemonicWarningModalCheckbox1()).toBeVisible()
  await createWalletFlow.mnemonicWarningModalCheckbox1().tap()
  await createWalletFlow.mnemonicWarningModalCheckbox2().tap()
  await createWalletFlow.mnemonicWarningModalConfirm().tap()
 })

 it('should be able to enter and verify the stored mnemonic', async () => {
  await utils.repeatSeedPhrase(seedPhraseText)
  await createWalletFlow.mnemonicCheckScreenConfirmButton().tap()
  await expect(myWalletsScreen.walletByNameButton(constants.wallet_Name)).toBeVisible()
 })

 it('should be able to open "New Test Wallet"', async () => {
  await myWalletsScreen.tabWallet('New Test Wallet').tap()
  await expect(walletMenuScreen.menuNFTGallery()).toBeVisible()
  await utils.takeScreenshot('New Test Wallet Home screen')
 })

 it('should be able to click "Swap" from wallet home and verify swap screen is displayed', async () => {
  await walletHomeScreen.swapButton().tap()
  await expect(swapScreen.inputSellQuantity()).toBeVisible()
 })

 it('should be able to enter quantities and select tokens', async () => {
  await swapScreen.inputSellQuantity().tap()
  await swapScreen.inputSellQuantity().clearText()
  await swapScreen.inputSellQuantity().replaceText('55.34')
  await swapScreen.selectBuyToken().tap()
  await swapScreen.swapTokenName(buyToken).tap()
  await swapScreen.inputSellQuantity().typeText('2')
  await utils.delay(5000)
  await expect(swapScreen.buttonSwapAction()).toBeVisible()
  await swapScreen.buttonSwapAction().tap()
 })
})
