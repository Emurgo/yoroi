import {device, expect} from 'detox'

import * as constants from '../../general/constants'
import * as restoreWalletFlow from '../../screens/restoreWalletFlow.screen'
import * as utils from '../../general/utils'
import * as chooseSetupTypeScreen from '../../screens/chooseSetupType.screen'
import * as chooseNetworkTypeScreen from '../../screens/chooseNetworkType.screen'
import * as chooseMnemonicTypeScreen from '../../screens/chooseMnemonicType.screen'

describe('Restore a wallet', () => {
 let platform: string
 beforeAll(async () => {
  const vars: any = await utils.initialize()
  platform = vars.platform
  await device.launchApp({newInstance: true})
  await utils.prepareApp(constants.valid_Pin)
 })

 it('should be able to select "restore wallet"', async () => {
  await chooseSetupTypeScreen.restoreWalletButton().tap()
  await expect(chooseNetworkTypeScreen.pageTitleCreateFlow()).toBeVisible()
 })

 it('should be able to select "preprod" network', async () => {
  await chooseNetworkTypeScreen.networkTestnetButton().tap()
  await expect(chooseMnemonicTypeScreen.mnemonic15WordTypeCard()).toBeVisible()
 })

 it('should be able to select "15 word" mnemonic type wallet', async () => {
  await chooseMnemonicTypeScreen.mnemonic15WordTypeCard().tap()
  await expect(restoreWalletFlow.step1Title()).toBeVisible()
 })

 it('should be able to complete "step1: 15-word recovery phrase"', async () => {
  await restoreWalletFlow.enterRecoveryPhrase(constants.normal_15_Word_Wallet.phrase, platform)
  await utils.takeScreenshot('Recovery Phrase entered')
  await expect(restoreWalletFlow.step1RecoveryPhraseSuccessMessage()).toBeVisible()
  await restoreWalletFlow.step1NextButton().tap()
  await expect(restoreWalletFlow.walletPlateNumber()).toBeVisible()
 })

 it('should be able to complete "step2 : set credentials"', async () => {
  await expect(restoreWalletFlow.walletPlateNumber()).toHaveText(constants.normal_15_Word_Wallet.checksum)
  await restoreWalletFlow.step2WalletNameInput().tap()
  await restoreWalletFlow.step2WalletNameInput().typeText(constants.wallet_Name)
  await restoreWalletFlow.step2SpendingPasswordInput().tap()
  await restoreWalletFlow.step2SpendingPasswordInput().typeText(`${constants.spending_Password}\n`)
  await restoreWalletFlow.step2RepeatSpendingPasswordInput().tap()
  await restoreWalletFlow.step2RepeatSpendingPasswordInput().typeText(constants.spending_Password)
  await utils.takeScreenshot('Set the spending password')
  await restoreWalletFlow.step2NextButton().tap()
  await expect(restoreWalletFlow.praparingYourWalletMessage()).toBeVisible()
 })
})
