import * as addWalletsScreen from '../screenObjects/addWallets.screen'
import * as addWalletScreen from '../screenObjects/addWallet.screen'
import * as createNewWalletCredentialsScreen from '../screenObjects/createWalletScreens/createWalletCredentials.screen'
import * as nobodyLookingScreen from '../screenObjects/createWalletScreens/nobodyLookingNotification.screen'
import * as recoveryPhraseRememberScreen from '../screenObjects/createWalletScreens/recoveryPhraseRemember.screen'
import * as recoveryPhraseNotificationScreen from '../screenObjects/createWalletScreens/recoveryPhraseNotification.screen'
import * as recoveryPhraseEnterScreen from '../screenObjects/createWalletScreens/recoveryPhraseEnter.screen'
import {firstAppLaunch, hideKeyboard} from '../helpers/utils'
import {WALLET_NAME, SPENDING_PASSWORD, DEFAULT_TIMEOUT, DEFAULT_INTERVAL} from '../constants'

const expect = require('chai').expect

describe('Creating a wallet', () => {
  // Execute a block of code before every tests
  beforeEach(() => {
    driver.launchApp()
  })
  // Execute a block of code after every tests
  afterEach(() => {
    driver.closeApp()
  })

  it('A straight happy path', async () => {
    await firstAppLaunch()
    await addWalletsScreen.addWalletTestnetButton().click()
    await addWalletScreen.createWalletButton().click()

    await createNewWalletCredentialsScreen.walletNameEdit().click()
    await createNewWalletCredentialsScreen.spendingPasswordEdit().click()
    await createNewWalletCredentialsScreen.spendingPasswordEdit().addValue(SPENDING_PASSWORD)
    await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit().click()
    await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit().addValue(SPENDING_PASSWORD)
    await hideKeyboard()

    await createNewWalletCredentialsScreen.continueButton().click()
    expect(await nobodyLookingScreen.understandButton().isDisplayed()).to.be.false

    await createNewWalletCredentialsScreen.walletNameEdit().addValue(WALLET_NAME)
    await hideKeyboard()
    await createNewWalletCredentialsScreen.continueButton().click()

    await nobodyLookingScreen.understandButton().click()

    const allWords = await recoveryPhraseRememberScreen.getAllWords()
    await recoveryPhraseRememberScreen.writtenItDownButton().click()

    await recoveryPhraseNotificationScreen.mySecretKeyOnDeviceCheckbox().click()
    await recoveryPhraseNotificationScreen.recoveringOnlyByPhraseCheckbox().click()
    await recoveryPhraseNotificationScreen.understandButton().click()

    await recoveryPhraseEnterScreen.enterRecoveryPhrase(allWords)
    await recoveryPhraseEnterScreen.confirmButton().click()

    expect(
      await driver.$(`[text="${WALLET_NAME}"]`).waitForExist({timeout: DEFAULT_TIMEOUT, interval: DEFAULT_INTERVAL}),
    ).to.be.true
  })
})
