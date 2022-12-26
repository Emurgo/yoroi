import { device, expect } from 'detox'
import { enterPIN, getSeedPhrase, repeatSeedPhrase, prepareApp } from './utils'
import { WALLET_NAME, SPENDING_PASSWORD, VALID_PIN } from './constants'
import * as createWalletFlow from './screens/createWalletFlow.screen'
import * as myWalletsScreen from './screens/myWallets.screen'

describe('Creating a wallet', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true })
        await prepareApp()
    });
  
    beforeEach(async () => {
        await device.reloadReactNative()
        await enterPIN(VALID_PIN)
    });

    it('add shelley-era wallet', async () => {
        await myWalletsScreen.addWalletTestnetButton().tap()
        await myWalletsScreen.createWalletButton().tap()

        await expect(createWalletFlow.walletNameInput()).toBeVisible()
        await createWalletFlow.walletNameInput().typeText(WALLET_NAME)
        await device.disableSynchronization()
        await createWalletFlow.spendingPasswordInput().typeText(SPENDING_PASSWORD)
        await createWalletFlow.repeatSpendingPasswordInput().typeText(`${SPENDING_PASSWORD}\n`)
        await device.enableSynchronization()

        await createWalletFlow.credentialsFormContinueButton().tap()
        await expect(createWalletFlow.mnemonicExplanationModal()).toBeVisible()
        await createWalletFlow.mnemonicExplanationModal().tap()

        const seedPhraseText = await getSeedPhrase()
        await createWalletFlow.mnemonicShowScreenConfirmButton().tap()
        await expect(createWalletFlow.mnemonicWarningModalCheckbox1()).toBeVisible()
        await createWalletFlow.mnemonicWarningModalCheckbox1().tap()
        await createWalletFlow.mnemonicWarningModalCheckbox2().tap()
        await createWalletFlow.mnemonicWarningModalConfirm().tap()

        await repeatSeedPhrase(seedPhraseText)
        await createWalletFlow.mnemonicCheckScreenConfirmButton().tap()

        await expect(myWalletsScreen.walletByNameButton(WALLET_NAME)).toBeVisible()
    });
  });