const pinCodePage = require('../pageObjects/pinCode.screen');

async function enterPinCode(pinCode) {
    for (const pinNumber of pinCode) {
        await pinCodePage.getPinKey(pinNumber).click();
    }
}

async function isChecked(element) {
    await driver.setImplicitTimeout(300);
    const result = await element.getAttribute('checked');
    console.log(`Element is checked: ${result}`);

    return result === 'true';
}

module.exports = {enterPinCode, isChecked};