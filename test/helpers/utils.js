const pinCodeScreen = require('../screenObjects/pinCode.screen');
const chooseLanguageScreen = require("../screenObjects/chooseLanguage.screen");
const tosScreen = require("../screenObjects/tos.screen");
const { VALID_PIN } = require("../constants");

async function enterPinCode(pinCode) {
    for (const pinNumber of pinCode) {
        await pinCodeScreen.getPinKey(pinNumber).click();
    }
}

async function isElementChecked(element) {
    await driver.setImplicitTimeout(300);
    const result = await element.getAttribute('checked');
    console.log(`Element is checked: ${result}`);

    return result === 'true';
}

async function firstAppLaunch() {
    await chooseLanguageScreen.chooseLanguageButton.click();
    await tosScreen.acceptToSCheckbox.click();
    await tosScreen.acceptToSButton.click();
    await enterPinCode(VALID_PIN);
    await enterPinCode(VALID_PIN);
    await driver.setImplicitTimeout(500);
}

async function hideKeyboard() {
    await driver.hideKeyboard('pressKey', 'Done');
}

module.exports = {
    enterPinCode,
    isElementChecked,
    firstAppLaunch,
    hideKeyboard,
};