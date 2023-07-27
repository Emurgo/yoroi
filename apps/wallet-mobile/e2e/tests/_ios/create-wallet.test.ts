import { device, expect } from 'detox'

import { SPENDING_PASSWORD, VALID_PIN,WALLET_NAME } from '../../constants'
import * as createWalletFlow from '../../screens/createWalletFlow.screen'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import { enterPIN, getSeedPhrase, prepareApp,repeatSeedPhrase } from '../../utils'

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

        await expect(createWalletFlow.credentialsView()).toBeVisible();
        await createWalletFlow.walletNameInput().typeText(WALLET_NAME)
   
        await createWalletFlow.spendingPasswordInput().tap()
        await createWalletFlow.spendingPasswordInput().typeText(`${SPENDING_PASSWORD}\n`)
        await device.enableSynchronization()
        await waitFor(createWalletFlow.repeatSpendingPasswordInput()).toBeVisible().withTimeout(10000)
        await createWalletFlow.repeatSpendingPasswordInput().tap()
        await createWalletFlow.repeatSpendingPasswordInput().typeText(SPENDING_PASSWORD)
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