import { device, expect } from 'detox'

import { SPENDING_PASSWORD,WALLET_NAME } from '../../constants'
import * as createWalletFlow from '../../screens/createWalletFlow.screen'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as utils from '../../utils'


describe('Creating a wallet', () => {
   let platform : string
   let seedPhraseText: string[]
   
    beforeAll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vars: any = await utils.initialize()
        platform = vars.platform    
        await device.launchApp({ newInstance: true })
        await utils.prepareApp()
    });

    it('should be able to initiate the "create wallet" process form the home screeen', async () => {
        await myWalletsScreen.addWalletTestnetButton().tap()
        await myWalletsScreen.createWalletButton().tap()
    })

    it('should be able to set the spending password', async() => {
        await expect(createWalletFlow.credentialsView()).toBeVisible();
        await createWalletFlow.walletNameInput().typeText(WALLET_NAME)
        await utils.disableDeviceSync(platform)
        await createWalletFlow.spendingPasswordInput().typeText(SPENDING_PASSWORD)
        await waitFor(createWalletFlow.repeatSpendingPasswordInput()).toBeVisible().withTimeout(10000)
        await createWalletFlow.repeatSpendingPasswordInput().typeText(`${SPENDING_PASSWORD}\n`)
        await utils.enableDeviceSync(platform)

        await createWalletFlow.credentialsFormContinueButton().tap()
        await expect(createWalletFlow.mnemonicExplanationModal()).toBeVisible()
        await createWalletFlow.mnemonicExplanationModal().tap()
    })    

    it('should be able to capture the menmoic displayed and proceed', async() => {
        seedPhraseText = await utils.getSeedPhrase()
        await createWalletFlow.mnemonicShowScreenConfirmButton().tap()
        await expect(createWalletFlow.mnemonicWarningModalCheckbox1()).toBeVisible()
        await createWalletFlow.mnemonicWarningModalCheckbox1().tap()
        await createWalletFlow.mnemonicWarningModalCheckbox2().tap()
        await createWalletFlow.mnemonicWarningModalConfirm().tap()
    })    

    it('should be able to enter and verify the stored mnemonic', async() => {   
        await utils.repeatSeedPhrase(seedPhraseText)
        await createWalletFlow.mnemonicCheckScreenConfirmButton().tap()
        await expect(myWalletsScreen.walletByNameButton(WALLET_NAME)).toBeVisible()
    });
  });