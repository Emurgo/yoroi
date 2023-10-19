import {device, expect} from 'detox'

import * as constants from '../../general/constants'
import * as createWalletFlow from '../../screens/createWalletFlow.screen'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as utils from '../../general/utils'

describe('Create a wallet', () => {
 let seedPhraseText: string[]

 beforeAll(async () => {
  await device.launchApp({newInstance: true})
  await utils.prepareApp(constants.valid_Pin)
 })

 it('should be able to initiate the "create wallet" process form the home screen', async () => {
  await utils.takeScreenshot('Home Screen')
  await myWalletsScreen.addWalletTestnetButton().tap()
  await myWalletsScreen.createWalletButton().tap()
 })

 it('should be able to set the spending password', async () => {
  await expect(createWalletFlow.credentialsView()).toBeVisible()
  await createWalletFlow.walletNameInput().typeText(constants.wallet_Name)
  await device.disableSynchronization()
  await createWalletFlow
   .spendingPasswordInput()
   .typeText(constants.spending_Password)
  await waitFor(createWalletFlow.repeatSpendingPasswordInput())
   .toBeVisible()
   .withTimeout(10000)
  await createWalletFlow
   .repeatSpendingPasswordInput()
   .typeText(`${constants.spending_Password}\n`)
  await device.enableSynchronization()
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
  await expect(
   myWalletsScreen.walletByNameButton(constants.wallet_Name),
  ).toBeVisible()
  await utils.takeScreenshot(`Wallet "${constants.wallet_Name} is added.`)
 })
})
