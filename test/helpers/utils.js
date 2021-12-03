const pinCodeScreen = require('../screenObjects/pinCode.screen');

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

module.exports = {enterPinCode, isElementChecked};