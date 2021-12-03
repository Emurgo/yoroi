class AddWallets {
    get addWalletButton(){
        return driver.$('//android.view.ViewGroup[@resource-id="addWalletOnHaskellShelleyButton"]');
    }

    get addWalletByronButton(){
        return driver.$('//android.view.ViewGroup[@resource-id="addWalletOnByronButton"]');
    }

    get addWalletTestnetButton(){
        return driver.$('//android.view.ViewGroup[@resource-id=""]');
    }

    get isDisplayed() {
        driver.setImplicitTimeout(400);
        return this.addWalletButton.isDisplayed();
    }
}

module.exports = new AddWallets();