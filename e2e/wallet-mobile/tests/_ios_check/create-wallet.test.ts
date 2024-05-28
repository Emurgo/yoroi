import {device, expect} from 'detox'

import * as constants from '../../general/constants'
import * as createWalletFlow from '../../screens/createWalletFlow.screen'
import * as chooseSetupTypeScreen from '../../screens/chooseSetupType.screen'
import * as chooseNetworkTypeScreen from '../../screens/chooseNetworkType.screen'
import * as createWalletStepsScreen from '../../screens/createWalletSteps.screen'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as utils from '../../general/utils'

describe('Create a wallet', () => {
 let seedPhraseText: string[]
 beforeAll(async () => {
  await device.launchApp({newInstance: true})
  await utils.prepareApp(constants.valid_Pin)
 })

 it('should be able to select "Create new wallet"', async () => {
  await chooseSetupTypeScreen.createNewWalletButton().tap()
  await expect(chooseNetworkTypeScreen.pageTitleCreateFlow()).toBeVisible()
 })

 it('should be able to select "testnet" network', async () => {
  await chooseNetworkTypeScreen.networkTestnetButton().tap()
  await expect(createWalletStepsScreen.step1Title()).toBeVisible()
 })

 it('should be able to complete "step1"', async () => {
  await expect(createWalletStepsScreen.step1TextToValidate()).toBeVisible()
  await createWalletStepsScreen.step1NextButton().tap()
 })

 it('should be able to complete "step2 - modal autoappear"', async () => {
  await expect(createWalletStepsScreen.step2TextToValidate1()).toBeVisible()
  await expect(createWalletStepsScreen.step2TextToValidate2()).toBeVisible()
  await createWalletStepsScreen.step2ContinueButton().tap()
 })

 it('should be able to complete "step2 - info modal"', async () => {
  await createWalletStepsScreen.step2InfoIcon().tap()
  await expect(createWalletStepsScreen.step2TextToValidate2()).toBeVisible()
  await createWalletStepsScreen.step2ContinueButton().tap()
 })

 it('should be able to complete "step2 - store mnemonic"', async () => {
  await createWalletStepsScreen.step2ShowRecoveryPhraseButton().tap()
  seedPhraseText = await utils.getSeedPhrase()
  await utils.takeScreenshot('Seed Phrase')
  await createWalletStepsScreen.step2NextButton().tap()
  await utils.addMsgToReport(seedPhraseText[2])
 })

 it('should be able to set the spending password', async () => {
  await expect(createWalletFlow.credentialsView()).toBeVisible()
  await createWalletFlow.walletNameInput().typeText(constants.wallet_Name)
  await createWalletFlow.spendingPasswordInput().tap()
  await createWalletFlow.spendingPasswordInput().typeText(`${constants.spending_Password}\n`)
  await waitFor(createWalletFlow.repeatSpendingPasswordInput()).toBeVisible().withTimeout(10000)
  await createWalletFlow.repeatSpendingPasswordInput().tap()
  await createWalletFlow.repeatSpendingPasswordInput().typeText(constants.spending_Password)
  await utils.takeScreenshot('Set the spending password')

  await createWalletFlow.credentialsFormContinueButton().tap()
  await expect(createWalletFlow.mnemonicExplanationModal()).toBeVisible()
  await createWalletFlow.mnemonicExplanationModal().tap()
 })

 it('should be able to capture the menmoic displayed and proceed', async () => {
  seedPhraseText = await utils.getSeedPhrase()
  await utils.takeScreenshot('Seed Phrase')
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
  await utils.takeScreenshot(`Wallet "${constants.wallet_Name} is added.`)
 })
})
