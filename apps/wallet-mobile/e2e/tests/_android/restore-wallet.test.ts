import { device, expect } from 'detox'

import { NORMAL_15_WORD_WALLET, SPENDING_PASSWORD } from '../../constants'
import * as myWalletsScreen from '../../screens/myWallets.screen'
import * as restoreWalletFlow from '../../screens/restoreWalletFlow.screen'
import * as utils  from '../../utils'

describe('Restore a wallet', () => {
    let platform : string

    beforeAll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vars: any = await utils.initialize()
        platform = vars.platform    
        await device.launchApp({ newInstance: true })
        await utils.prepareApp()
    });

    it('should be able to initiate the "restore wallet" process from home screen', async () => {
        await myWalletsScreen.addWalletTestnetButton().tap();
        await myWalletsScreen.restoreWalletButton().tap();
        await restoreWalletFlow.restoreNormalWalletButton().tap();
    });

    it('should be able to enter the 15-word recovery phrase', async() => {
        await utils.enterRecoveryPhrase(NORMAL_15_WORD_WALLET.phrase, platform);
        await restoreWalletFlow.mnemonicRestoreWalletButton().tap();

        await expect(restoreWalletFlow.walletChecksumText()).toBeVisible();
        await expect(restoreWalletFlow.walletChecksumText()).toHaveText(NORMAL_15_WORD_WALLET.checksum);
        await restoreWalletFlow.verifyWalletContinueButton().tap();
        await expect(restoreWalletFlow.credentialsView()).toBeVisible();
    })

    it('should be able to set the spending password', async() => {
        await restoreWalletFlow.walletNameInput().typeText(NORMAL_15_WORD_WALLET.name);
        await utils.disableDeviceSync(platform)
        await restoreWalletFlow.spendingPasswordInput().typeText(SPENDING_PASSWORD);
        await restoreWalletFlow.repeatSpendingPasswordInput().typeText(`${SPENDING_PASSWORD}\n`);
        await utils.enableDeviceSync(platform)
        await restoreWalletFlow.credentialsContinueButton().tap();
        await expect(myWalletsScreen.pageTitle()).toBeVisible();
        await expect(myWalletsScreen.walletByNameButton(NORMAL_15_WORD_WALLET.name)).toBeVisible();
    });
});