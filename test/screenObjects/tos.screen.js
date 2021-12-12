class ToS {
    get acceptToSCheckbox() {
        return driver.$('//*[@resource-id="acceptTosCheckbox"]');
    }

    get acceptToSButton() {
        return driver.$('//*[@resource-id="acceptTosButton"]');
    }
}

module.exports = new ToS();