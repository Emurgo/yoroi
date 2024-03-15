import {device, expect} from 'detox'

import * as constants from '../../general/constants'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as restoreWalletFlow from '../../screens/restoreWalletFlow.screen'
import * as utils from '../../general/utils'

describe('Restore a wallet', () => {
 let platform: string

 beforeAll(async () => {
  const vars: any = await utils.initialize()
  platform = vars.platform
  await device.launchApp({newInstance: true})
  await utils.prepareApp(constants.valid_Pin)
 })

 it('should be able to initiate the "restore wallet" process from home screen', async () => {
  await myWalletsScreen.addWalletTestnetButton().tap()
  await myWalletsScreen.restoreWalletButton().tap()
  await restoreWalletFlow.restoreNormalWalletButton().tap()
 })

 it('should be able to enter the 15-word recovery phrase', async () => {
  await utils.enterRecoveryPhrase(
   constants.normal_15_Word_Wallet.phrase,
   platform,
  )
  await restoreWalletFlow.mnemonicRestoreWalletButton().tap()

  await expect(restoreWalletFlow.walletChecksumText()).toBeVisible()
  await expect(restoreWalletFlow.walletChecksumText()).toHaveText(
   constants.normal_15_Word_Wallet.checksum,
  )
  await restoreWalletFlow.verifyWalletContinueButton().tap()
  await expect(restoreWalletFlow.credentialsView()).toBeVisible()
 })

 it('should be able to set the spending password', async () => {
  await restoreWalletFlow
   .walletNameInput()
   .typeText(constants.normal_15_Word_Wallet.name)
  await device.disableSynchronization()
  await restoreWalletFlow
   .spendingPasswordInput()
   .typeText(constants.spending_Password)
  await restoreWalletFlow
   .repeatSpendingPasswordInput()
   .typeText(`${constants.spending_Password}\n`)
  await device.enableSynchronization()
  await restoreWalletFlow.credentialsContinueButton().tap()
  await expect(myWalletsScreen.pageTitle()).toBeVisible()
  await expect(
   myWalletsScreen.walletByNameButton(constants.normal_15_Word_Wallet.name),
  ).toBeVisible()
 })
})
