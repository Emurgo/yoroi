import { device, expect } from 'detox'

import { NORMAL_15_WORD_WALLET, SPENDING_PASSWORD, VALID_PIN } from '../../constants'
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

    beforeEach(async () => {
        await device.reloadReactNative()
        await utils.enterPIN(VALID_PIN)
    });

    it('15-word shelley wallet', async () => {
        await myWalletsScreen.addWalletTestnetButton().tap();
        await myWalletsScreen.restoreWalletButton().tap();
        await restoreWalletFlow.restoreNormalWalletButton().tap();

        await utils.enterRecoveryPhrase(NORMAL_15_WORD_WALLET.phrase, platform);
        await restoreWalletFlow.mnemonicRestoreWalletButton().tap();

        await expect(restoreWalletFlow.walletChecksumText()).toBeVisible();
        await expect(restoreWalletFlow.walletChecksumText()).toHaveText(NORMAL_15_WORD_WALLET.checksum);
        await restoreWalletFlow.verifyWalletContinueButton().tap();

        await expect(restoreWalletFlow.credentialsView()).toBeVisible();
        await restoreWalletFlow.walletNameInput().typeText(NORMAL_15_WORD_WALLET.name);
        await device.disableSynchronization();
        await restoreWalletFlow.spendingPasswordInput().typeText(SPENDING_PASSWORD);
        await restoreWalletFlow.repeatSpendingPasswordInput().typeText(`${SPENDING_PASSWORD}\n`);
        await device.enableSynchronization();
        await restoreWalletFlow.credentialsContinueButton().tap();

        await expect(myWalletsScreen.pageTitle()).toBeVisible();
        await expect(myWalletsScreen.walletByNameButton(NORMAL_15_WORD_WALLET.name)).toBeVisible();
    });
});