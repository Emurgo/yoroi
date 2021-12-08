const addWalletsScreen = require('../screenObjects/addWallets.screen');
const addWalletScreen = require('../screenObjects/addWallet.screen');
const createNewWalletCredentialsScreen = require('../screenObjects/createWalletScreens/createWalletCredentials.screen');
const nobodyLookingScreen = require('../screenObjects/createWalletScreens/nobodyLookingNotification.screen');
const recoveryPhraseRememberScreen = require('../screenObjects/createWalletScreens/recoveryPhraseRemember.screen');
const { firstAppLaunch, hideKeyboard } = require("../helpers/utils");
const { WALLET_NAME, SPENDING_PASSWORD } = require("../constants");
const expect = require('chai').expect;

describe('Creating a wallet', () => {
  // before(async () => {
  //   await firstAppLaunch();
  // });
  // Execute a block of code before every test
  beforeEach(() => {
    driver.launchApp();
  });
  // Execute a block of code after every test
  afterEach(() => {
    driver.closeApp();
  });

  it("Happy path", async () => {
    await firstAppLaunch();
    await addWalletsScreen.addWalletTestnetButton.click();
    await addWalletScreen.createWalletButton.click();
    await createNewWalletCredentialsScreen.walletNameEdit.addValue(WALLET_NAME);
    await createNewWalletCredentialsScreen.spendingPasswordEdit.click();
    await createNewWalletCredentialsScreen.spendingPasswordEdit.addValue(SPENDING_PASSWORD);
    await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit.click();
    await createNewWalletCredentialsScreen.repeatSpendingPasswordEdit.addValue(SPENDING_PASSWORD);
    await hideKeyboard();
    await createNewWalletCredentialsScreen.continueButton.click();
    await nobodyLookingScreen.understandButton.click();
    const allWords = await recoveryPhraseRememberScreen.getAllWords();
    console.log(allWords);
  });
});