class ToS {
    get acceptToSCheckbox() {
        // return driver.$('~acceptTosCheckbox');
        return driver.$('//android.view.ViewGroup[@resource-id="acceptTosCheckbox"]');
    }

    get acceptToSButton() {
        // return driver.$('~acceptTosButton');
        return driver.$('//android.view.ViewGroup[@resource-id="acceptTosButton"]');
    }
}

module.exports = new ToS();