import {device, expect} from 'detox'

import * as constants from '../../general/constants'
import * as chooseSetupTypeScreen from '../../screens/chooseSetupType.screen'
import * as chooseNetworkTypeScreen from '../../screens/chooseNetworkType.screen'
import * as createWalletStepsScreen from '../../screens/createWalletSteps.screen'
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

 it('should be able to complete "step2 - handle modal autoappear"', async () => {
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
  seedPhraseText = await createWalletStepsScreen.getSeedPhrase()
  await createWalletStepsScreen.step2NextButton().tap()
  await utils.addMsgToReport(`Seedphrase: ${seedPhraseText}`)
 })

 it('should be able to complete "step3 - enter and verify the stored mnemonic"', async () => {
  await createWalletStepsScreen.repeatSeedPhrase(seedPhraseText)
  await expect(createWalletStepsScreen.step3RecoveryPhraseValidatedText()).toBeVisible()
  await createWalletStepsScreen.step3NextButton().tap()
 })

 it('should be able to complete "step4 - handle info modal"', async () => {
  await expect(createWalletStepsScreen.step4Title1OnModal()).toBeVisible()
  await expect(createWalletStepsScreen.step4Title2OnModal()).toBeVisible()
  await createWalletStepsScreen.step4ModalContinueButton().tap()
 })

 it('should be able to complete "step4 - set credentials"', async () => {
  await createWalletStepsScreen.step4WalletNameInput().tap()
  await createWalletStepsScreen.step4WalletNameInput().typeText(constants.wallet_Name)
  await createWalletStepsScreen.step4SpendingPasswordInput().tap()
  await createWalletStepsScreen.step4SpendingPasswordInput().typeText(`${constants.spending_Password}\n`)
  await createWalletStepsScreen.step4RepeatSpendingPasswordInput().tap()
  await createWalletStepsScreen.step4RepeatSpendingPasswordInput().typeText(constants.spending_Password)
  await utils.takeScreenshot('Set the spending password')
  await createWalletStepsScreen.step4NextButton().tap()
  await expect(createWalletStepsScreen.praparingYourWalletMessage()).toBeVisible()
 })
})
