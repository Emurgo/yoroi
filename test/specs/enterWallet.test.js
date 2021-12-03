const { enterPinCode } = require('../helpers/utils');
const tosScreen = require('../screenObjects/tos.screen');
const chooseLanguageScreen = require('../screenObjects/chooseLanguage.screen');
const alertScreen = require('../screenObjects/alert.screen');
const addWalletsScreen = require('../screenObjects/addWallets.screen')
const expect = require('chai').expect;

describe('First entrance', () => {
    // Execute a block of code before every test
    beforeEach(() => {
        driver.launchApp();
    });
    // Execute a block of code after every test
    afterEach(() => {
        driver.closeApp();
    })

    it('Accept ToS, enter incorrect PIN', async () => {
        await chooseLanguageScreen.chooseLanguageButton.click();
        await tosScreen.acceptToSCheckbox.click();
        await tosScreen.acceptToSButton.click();
        await enterPinCode('123456');
        await enterPinCode('123455');
        expect(await alertScreen.title.isDisplayed()).to.be.true;
        expect(await alertScreen.message.isDisplayed()).to.be.true;
        expect(await alertScreen.title.getText()).to.be.equal('Invalid PIN');
        expect(await alertScreen.message.getText()).to.be.equal('PINs do not match.');
    });

    it('Accept ToS, enter correct PIN', async () => {
        await chooseLanguageScreen.chooseLanguageButton.click();
        await tosScreen.acceptToSCheckbox.click();
        await tosScreen.acceptToSButton.click();
        await enterPinCode('123456');
        await enterPinCode('123456');
        expect(await addWalletsScreen.isDisplayed).to.be.true;
    });
})